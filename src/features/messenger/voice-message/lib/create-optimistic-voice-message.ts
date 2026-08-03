import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type MessageViewModel,
} from '@/entities/messenger'

interface CreateOptimisticVoiceMessageOptions {
  file: File
  fileUrl: string
  ownerId: number
  receiverId: number
}

export function createOptimisticVoiceMessage({
  file,
  fileUrl,
  ownerId,
  receiverId,
}: CreateOptimisticVoiceMessageOptions): MessageViewModel {
  const now = new Date().toISOString()

  return {
    id: -Date.now(),
    ownerId,
    receiverId,
    messageText: null,
    mediaContent: {
      fileType: MediaFileType.VOICE,
      fileUrl,
      fileSize: file.size,
    },
    status: MessageStatus.SENT,
    messageType: MessageType.VOICE,
    createdAt: now,
    updatedAt: now,
  }
}
