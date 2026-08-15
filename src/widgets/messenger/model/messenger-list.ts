import type { SearchUserItem } from '@/entities/users/api/api.types'

import {
  getDialoguePartnerId,
  MessageType,
  type LastMessageViewDto,
  type MessengerListItem,
} from '@/entities/messenger'

const getPreview = (type: MessageType, text: string | null) => {
  if (text) {
    return text
  }

  if (type === MessageType.IMAGE) {
    return 'Image'
  }

  if (type === MessageType.VOICE) {
    return 'Voice message'
  }

  return null
}

export function buildDialogueItems(
  dialogues: readonly LastMessageViewDto[],
  currentUserId: number
): MessengerListItem[] {
  return dialogues.flatMap(dialogue => {
    const userId = getDialoguePartnerId(dialogue, currentUserId)

    if (userId === null) {
      return []
    }

    const preview = getPreview(dialogue.messageType, dialogue.messageText)
    const isOwnLastMessage = dialogue.ownerId === currentUserId
    const lastMessage = preview && isOwnLastMessage ? `You: ${preview}` : preview

    return [
      {
        userId,
        userName: dialogue.userName,
        avatarUrl: dialogue.avatars[0]?.url,
        lastMessage,
        updatedAt: dialogue.updatedAt,
      },
    ]
  })
}

export function appendNewContactItems(
  dialogueItems: readonly MessengerListItem[],
  users: readonly SearchUserItem[],
  currentUserId: number
): MessengerListItem[] {
  const knownIds = new Set(dialogueItems.map(item => item.userId))
  const newContacts = users
    .filter(user => user.id !== currentUserId && !knownIds.has(user.id))
    .map<MessengerListItem>(user => ({
      userId: user.id,
      userName: user.userName,
      avatarUrl: user.avatars[0]?.url,
      lastMessage: 'Start a conversation',
      updatedAt: null,
    }))

  return [...dialogueItems, ...newContacts]
}
