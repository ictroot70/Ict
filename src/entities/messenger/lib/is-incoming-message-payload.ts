import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type MediaContentViewModel,
  type MessageViewModel,
} from '../model/messenger.types'

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

const isMediaFileType = (value: unknown): value is MediaFileType =>
  Object.values(MediaFileType).some(type => type === value)

const isMediaContent = (value: unknown): value is MediaContentViewModel => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isMediaFileType(value.fileType) &&
    typeof value.fileUrl === 'string' &&
    value.fileUrl.length > 0 &&
    typeof value.fileSize === 'number' &&
    Number.isFinite(value.fileSize) &&
    value.fileSize >= 0
  )
}

export function isIncomingMessagePayload(payload: unknown): payload is MessageViewModel {
  if (!isRecord(payload)) {
    return false
  }

  return (
    isInteger(payload.id) &&
    isInteger(payload.ownerId) &&
    isInteger(payload.receiverId) &&
    (typeof payload.messageText === 'string' || payload.messageText === null) &&
    (payload.mediaContent === null || isMediaContent(payload.mediaContent)) &&
    isMessageStatus(payload.status) &&
    isMessageType(payload.messageType) &&
    isDateString(payload.createdAt) &&
    isDateString(payload.updatedAt)
  )
}
