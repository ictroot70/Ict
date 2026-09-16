import { MessageStatus, type MessageViewModel } from '../model'

const statusRank: Record<MessageStatus, number> = {
  [MessageStatus.SENT]: 0,
  [MessageStatus.RECEIVED]: 1,
  [MessageStatus.READ]: 2,
}

export const mergeMessageStatus = (currentStatus: MessageStatus, incomingStatus: MessageStatus) =>
  statusRank[incomingStatus] >= statusRank[currentStatus] ? incomingStatus : currentStatus

export function upsertMessageInHistory(
  messages: readonly MessageViewModel[],
  incomingMessage: MessageViewModel
): MessageViewModel[] {
  const messageExists = messages.some(message => message.id === incomingMessage.id)

  if (!messageExists) {
    return [...messages, incomingMessage]
  }

  return messages.map(message =>
    message.id === incomingMessage.id
      ? {
          ...incomingMessage,
          status: mergeMessageStatus(message.status, incomingMessage.status),
        }
      : message
  )
}
