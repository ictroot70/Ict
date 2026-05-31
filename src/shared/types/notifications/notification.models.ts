export interface NotificationViewDto {
  id: number
  message: string
  isRead: boolean
  notifyAt: string
  createdAt: string
}

export interface NotificationsPageDto {
  pageSize: number
  totalCount: number
  /** Source of truth для unread badge. null означает «не изменилось» */
  notReadCount: number | null
  items: NotificationViewDto[]
}

export interface UpdateNotificationIsReadDto {
  ids: number[]
}

export interface WsNotificationPayload {
  id: number
  message: string
  isRead: boolean
  notifyAt: string
  [key: string]: unknown
}

export type WsNotificationPayloadRaw = Record<string, unknown>
