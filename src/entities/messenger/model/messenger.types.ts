import type { AvatarViewDto } from '@/shared/types/base/common'

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
}

export enum MessageStatus {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  READ = 'READ',
}

export interface MessageViewModel {
  id: number
  ownerId: number
  receiverId: number
  messageText: string
  status: MessageStatus
  messageType: MessageType
  createdAt: string
  updatedAt: string
}

export interface LastMessageViewDto extends MessageViewModel {
  userName: string
  avatars: AvatarViewDto[]
  notReadCount: number
}

export interface UpdateMessagesStatusDto {
  ids: number[]
}
