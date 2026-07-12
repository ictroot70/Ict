import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)

const isDateString = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))

const isMessageType = (value: unknown): value is MessageType =>
  Object.values(MessageType).some(type => type === value)

const isMessageStatus = (value: unknown): value is MessageStatus =>
  Object.values(MessageStatus).some(status => status === value)

export function validateIncomingMessagePayload(payload: unknown): payload is MessageViewModel {
  if (!isRecord(payload)) {
    return false
  }

  return (
    isInteger(payload.id) &&
    isInteger(payload.ownerId) &&
    isInteger(payload.receiverId) &&
    typeof payload.messageText === 'string' &&
    isMessageStatus(payload.status) &&
    isMessageType(payload.messageType) &&
    isDateString(payload.createdAt) &&
    isDateString(payload.updatedAt)
  )
}
