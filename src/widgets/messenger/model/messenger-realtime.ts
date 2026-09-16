import {
  getDialoguePartnerId,
  isIncomingMessage,
  MessageStatus,
  mergeMessageStatus,
  upsertMessageInHistory,
  type DialogueMessagesResponseDto,
  type LastMessageViewDto,
  type MessageViewModel,
  type MessengerDialogsResponseDto,
} from '@/entities/messenger'

export const MESSENGER_DIALOGS_PAGE_SIZE = 50
export const MESSENGER_UNREAD_DIALOGS_PAGE_SIZE = 1

export const getMessengerPartnerIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/messenger\/(\d+)$/)

  return match ? Number(match[1]) : null
}

const getTimestamp = (value: string) => new Date(value).getTime()

const isMessageNewerThanDialoguePreview = (
  message: MessageViewModel,
  dialogue: LastMessageViewDto
) => getTimestamp(message.createdAt) >= getTimestamp(dialogue.createdAt)

const getNextPreviewStatus = (
  currentDialogue: LastMessageViewDto,
  message: MessageViewModel,
  shouldReplacePreview: boolean
) => {
  if (currentDialogue.id === message.id) {
    return mergeMessageStatus(currentDialogue.status, message.status)
  }

  return shouldReplacePreview ? message.status : currentDialogue.status
}

export function shouldHandleRealtimeMessage(message: MessageViewModel, currentUserId: number) {
  return currentUserId > 0 && getDialoguePartnerId(message, currentUserId) !== null
}

export function selectUnreadIncomingMessageIds(
  messages: readonly MessageViewModel[],
  currentUserId: number,
  ignoredMessageIds: ReadonlySet<number> = new Set()
) {
  if (currentUserId <= 0) {
    return []
  }

  return messages
    .filter(
      message =>
        isIncomingMessage(message, currentUserId) &&
        message.status !== MessageStatus.READ &&
        !ignoredMessageIds.has(message.id)
    )
    .map(message => message.id)
}

export function applyMessageToDialogueMessages(
  history: DialogueMessagesResponseDto,
  message: MessageViewModel,
  currentUserId: number,
  activePartnerId: number | null
): DialogueMessagesResponseDto {
  if (
    !shouldHandleRealtimeMessage(message, currentUserId) ||
    getDialoguePartnerId(message, currentUserId) !== activePartnerId
  ) {
    return history
  }

  const messageExists = history.items.some(item => item.id === message.id)

  return {
    ...history,
    totalCount: messageExists ? history.totalCount : history.totalCount + 1,
    items: upsertMessageInHistory(history.items, message),
  }
}

// Only patches the open dialogue's message list (removing an id is unambiguous and safe
// to do locally). The dialogs list preview/unread count is intentionally NOT recomputed
// here: without the full deleted message we cannot know if it was the dialogue's preview
// or whether it was unread, so guessing would risk showing stale or wrong data. The caller
// is expected to invalidate the `MessengerDialogs` cache tag instead, letting a real REST
// refetch supply the correct preview and counts.
export function removeMessageFromDialogueMessages(
  history: DialogueMessagesResponseDto,
  messageId: number
): DialogueMessagesResponseDto {
  const messageExists = history.items.some(item => item.id === messageId)

  if (!messageExists) {
    return history
  }

  return {
    ...history,
    totalCount: Math.max(0, history.totalCount - 1),
    items: history.items.filter(item => item.id !== messageId),
  }
}

export function applyMessageToMessengerDialogs(
  dialogs: MessengerDialogsResponseDto,
  message: MessageViewModel,
  currentUserId: number,
  activePartnerId: number | null
): MessengerDialogsResponseDto {
  if (!shouldHandleRealtimeMessage(message, currentUserId)) {
    return dialogs
  }

  const partnerId = getDialoguePartnerId(message, currentUserId)

  if (partnerId === null) {
    return dialogs
  }

  const dialogueIndex = dialogs.items.findIndex(
    dialogue => getDialoguePartnerId(dialogue, currentUserId) === partnerId
  )

  const isIncoming = isIncomingMessage(message, currentUserId)

  if (dialogueIndex === -1) {
    const shouldIncreaseUnread = isIncoming && message.status !== MessageStatus.READ

    return {
      ...dialogs,
      notReadCount: dialogs.notReadCount + (shouldIncreaseUnread ? 1 : 0),
    }
  }

  const currentDialogue = dialogs.items[dialogueIndex]
  const isSamePreviewMessage = currentDialogue.id === message.id
  const isActiveDialogue = activePartnerId === partnerId
  const shouldReplacePreview =
    isSamePreviewMessage || isMessageNewerThanDialoguePreview(message, currentDialogue)
  const shouldIncreaseUnread =
    !isSamePreviewMessage &&
    !isActiveDialogue &&
    isIncoming &&
    message.status !== MessageStatus.READ
  const unreadCountToClear = isActiveDialogue && isIncoming ? currentDialogue.notReadCount : 0
  const unreadCountDelta = (shouldIncreaseUnread ? 1 : 0) - unreadCountToClear
  const nextDialogueUnreadCount = Math.max(0, currentDialogue.notReadCount + unreadCountDelta)
  const nextTotalUnreadCount = Math.max(0, dialogs.notReadCount + unreadCountDelta)
  const updatedDialogue: LastMessageViewDto = {
    ...currentDialogue,
    ...(shouldReplacePreview ? message : {}),
    status: getNextPreviewStatus(currentDialogue, message, shouldReplacePreview),
    notReadCount: nextDialogueUnreadCount,
  }
  const nextItems = [...dialogs.items]

  nextItems[dialogueIndex] = updatedDialogue

  return {
    ...dialogs,
    notReadCount: nextTotalUnreadCount,
    items:
      shouldReplacePreview && !isSamePreviewMessage
        ? [updatedDialogue, ...dialogs.items.filter((_, index) => index !== dialogueIndex)]
        : nextItems,
  }
}
