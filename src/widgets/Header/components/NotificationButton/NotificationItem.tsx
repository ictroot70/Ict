import { KeyboardEvent } from 'react'

import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Typography } from '@/shared/ui'

import s from './NotificationButton.module.scss'

export interface NotificationUiModel {
  id: number
  title?: string
  message: string
  time: string
  isRead: boolean
}

export const NotificationItem = ({
  notification,
  onNotificationClick,
  onKeyDown,
  setItemRef,
  isLast,
}: {
  notification: NotificationUiModel
  onNotificationClick: (notification: NotificationUiModel) => void
  onKeyDown: (e: KeyboardEvent, notification: NotificationUiModel) => void
  setItemRef: (id: number, el: HTMLElement | null) => void
  isLast: boolean
}) => {
  const timeAgo = useTimeAgo(notification.time)

  return (
    <>
      <div
        ref={el => setItemRef(notification.id, el)}
        data-notification-id={notification.id}
        className={`${s.notificationItem} ${!notification.isRead ? s.unread : ''}`}
        onClick={() => onNotificationClick(notification)}
        onKeyDown={e => onKeyDown(e, notification)}
        role={'button'}
        tabIndex={0}
      >
        <div className={s.notificationContent}>
          <div className={s.notificationTitle}>
            {notification.title && <span className={s.titleText}>{notification.title}</span>}
            {!notification.isRead && <span className={s.newLabel}>New</span>}
          </div>

          <Typography variant={'regular_14'} className={s.notificationMessage}>
            {notification.message}
          </Typography>

          <Typography variant={'small_text'} className={s.notificationTime}>
            {timeAgo}
          </Typography>
        </div>
      </div>

      {!isLast && <div className={s.menuDivider} aria-hidden={'true'}></div>}
    </>
  )
}
