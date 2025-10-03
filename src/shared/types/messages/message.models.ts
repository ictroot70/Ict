import { MessageType, MessageStatus } from '../base/enums'
import { AvatarViewDto } from '../base/common'

export interface MessageViewModel {
  id: number
  ownerId: number
  receiverId: number
  messageText: string
  createdAt: string
  updatedAt: string
  messageType: MessageType
  status: MessageStatus
}

export interface LastMessageViewDto extends MessageViewModel {
  userName: string
  avatars: AvatarViewDto[]
}

export interface UpdateMessagesStatusDto {
  ids: number[]
}
