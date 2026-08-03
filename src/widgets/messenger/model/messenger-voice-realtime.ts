import {
  getDialoguePartnerId,
  isIncomingMessage,
  MessageStatus,
  MessageType,
  upsertMessageInHistory,
  type DialogueMessagesResponseDto,
  type LastMessageViewDto,
  type MessageViewModel,
  type MessengerDialogsResponseDto,
} from '@/entities/messenger'

export const MESSENGER_DIALOGS_PAGE_SIZE = 50
export const MESSENGER_DIALOGUE_MESSAGES_PAGE_SIZE = 50

export function shouldHandleVoiceRealtimeMessage(message: MessageViewModel, currentUserId: number) {
  return currentUserId > 0 && message.messageType === MessageType.VOICE
}

export function shouldMarkVoiceMessageAsRead(
  message: MessageViewModel,
  currentUserId: number,
  activePartnerId: number | null
) {
  return (
    shouldHandleVoiceRealtimeMessage(message, currentUserId) &&
    isIncomingMessage(message, currentUserId) &&
    message.status !== MessageStatus.READ &&
    getDialoguePartnerId(message, currentUserId) === activePartnerId
  )
}

export function applyVoiceMessageToDialogueMessages(
  history: DialogueMessagesResponseDto,
  message: MessageViewModel,
  currentUserId: number,
  activePartnerId: number | null
): DialogueMessagesResponseDto {
  if (
    !shouldHandleVoiceRealtimeMessage(message, currentUserId) ||
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

export function applyVoiceMessageToMessengerDialogs(
  dialogs: MessengerDialogsResponseDto,
  message: MessageViewModel,
  currentUserId: number,
  activePartnerId: number | null
): MessengerDialogsResponseDto {
  if (!shouldHandleVoiceRealtimeMessage(message, currentUserId)) {
    return dialogs
  }

  const partnerId = getDialoguePartnerId(message, currentUserId)

  if (partnerId === null) {
    return dialogs
  }

  const dialogueIndex = dialogs.items.findIndex(
    dialogue => getDialoguePartnerId(dialogue, currentUserId) === partnerId
  )

  if (dialogueIndex === -1) {
    return dialogs
  }

  const currentDialogue = dialogs.items[dialogueIndex]
  const wasAlreadyApplied = currentDialogue.id === message.id
  const isActiveDialogue = activePartnerId === partnerId
  const shouldIncreaseUnread =
    !wasAlreadyApplied &&
    !isActiveDialogue &&
    isIncomingMessage(message, currentUserId) &&
    message.status !== MessageStatus.READ
  const nextDialogueUnreadCount = currentDialogue.notReadCount + (shouldIncreaseUnread ? 1 : 0)
  const nextTotalUnreadCount = dialogs.notReadCount + (shouldIncreaseUnread ? 1 : 0)
  const updatedDialogue: LastMessageViewDto = {
    ...currentDialogue,
    ...message,
    notReadCount: nextDialogueUnreadCount,
  }

  return {
    ...dialogs,
    notReadCount: nextTotalUnreadCount,
    items: [updatedDialogue, ...dialogs.items.filter((_, index) => index !== dialogueIndex)],
  }
}
