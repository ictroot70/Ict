export interface NotificationViewDto {
  id: number
  message: string
  isRead: boolean
  createdAt: string
}

export interface UpdateNotificationIsReadDto {
  ids: number[]
}
