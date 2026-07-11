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

export interface GetMessengerDialogsParams {
  cursor?: number
  pageSize?: number
  searchName?: string
}
export interface MessengerDialogsResponseDto {
  pageSize: number
  totalCount: number
  notReadCount: number
  items: LastMessageViewDto[]
}

export interface GetDialogueMessagesParams {
  dialoguePartnerId: number
  cursor?: number
  pageSize?: number
  searchName?: string
}

export interface DialogueMessagesResponseDto {
  pageSize: number
  totalCount: number
  notReadCount: number
  items: MessageViewModel[]
}

export interface SendMessagePayload {
  message: string
  receiverId: number
}

export interface UpdateMessagePayload {
  id: number
  message: string
}

export type MessageAcknowledgement = (payload: SendMessagePayload) => void

export interface MessengerSocketErrorDto {
  message: string
  error: string
}

export type MessengerErrorSource = 'api' | 'socket' | 'validation'

export interface MessengerError {
  source: MessengerErrorSource
  code: string
  message: string
}
