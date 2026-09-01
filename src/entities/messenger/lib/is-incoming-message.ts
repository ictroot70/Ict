import { MessageType, type MessageViewModel } from '../model'

export function isIncomingMessage(message: MessageViewModel, currentUserId: number) {
  if (currentUserId <= 0) {
    return false
  }

  if (message.messageType === MessageType.VOICE) {
    return message.receiverId === currentUserId
  }

  return message.ownerId !== currentUserId
}
