export interface NotificationViewDto {
  id: number
  message: string
  isRead: boolean
  notifyAt: string
  createdAt: string
}

export interface NotificationsListResponse {
  pageSize: number
  totalCount: number
  notReadCount: number | null
  items: NotificationViewDto[]
}

export interface UpdateNotificationIsReadDto {
  ids: number[]
}

export interface NotificationSocketPayload {
  id: number
  clientId?: string
  message: string
  isRead: boolean
  notifyAt: string
}
