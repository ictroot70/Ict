import React, { useEffect, useRef, useState } from 'react'

import { BellOutline, ScrollAreaRadix, Typography } from '@/shared/ui'

import s from './NotificationButton.module.scss'

/*
 * Notification interface
 * @interface Notification
 * @property {number} id - Unique identifier of the notification
 * @property {string} title - Notification title
 * @property {string} message - Notification text
 * @property {string} time - Notification time (e.g. "2 hours ago")
 * @property {boolean} isRead - Notification read status
 */

export interface Notification {
  id: number
  title: string
  message: string
  time: string
  isRead: boolean
}

/*
 * Props of the NotificationButton component
 * @interface NotificationButtonProps
 * @property {Notification[]} [notifications] - Notification array
 * @property {Function} [onNotificationClick] - Notification Click Handler
 * @property {string} [className] - Additional CSS classes
 */

interface NotificationButtonProps {
  notifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

export const NotificationButton = ({
  notifications = [
    {
      id: 1,
      title: 'New Message',
      message: 'You have a new message from the system administrator',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: 2,
      title: 'System Update',
      message: 'Maintenance scheduled for tomorrow from 23:00 to 01:00',
      time: '5 hours ago',
      isRead: false,
    },
    {
      id: 3,
      title: 'Task completed',
      message: 'Your "Monthly Report" task has been completed successfully',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: 4,
      title: 'Task completed',
      message: 'Your "Monthly Report" task has been completed successfully',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: 5,
      title: 'Task completed',
      message: 'Your "Monthly Report" task has been completed successfully',
      time: '1 day ago',
      isRead: true,
    },
  ],
  onNotificationClick,
  className,
}: NotificationButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleButtonClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  return (
    <div className={`${s.notificationWrapper} ${className}`}>
      <button
        ref={buttonRef}
        className={s.notificationBtn}
        onClick={handleButtonClick}
        title={'Уведомления'}
        aria-expanded={isMenuOpen}
        type={'button'}
      >
        <BellOutline size={24} />
      </button>

      {isMenuOpen && (
        <div className={s.notificationMenu} ref={menuRef}>
          <div className={s.beak} aria-hidden={'true'}></div>

          <div className={s.menuHeader}>
            <Typography variant={'h3'} className={s.menuTitle}>
              Уведомления
            </Typography>
          </div>

          <div className={s.menuDivider} aria-hidden={'true'}></div>

          <ScrollAreaRadix
            className={s.notificationsScrollArea}
            viewportClassName={s.notificationsViewport}
          >
            <div className={s.notificationsList}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <div
                    className={`${s.notificationItem} ${!notification.isRead ? s.unread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    role={'button'}
                    tabIndex={0}
                  >
                    <div className={s.notificationContent}>
                      <div className={s.notificationTitle}>
                        <span className={s.titleText}>{notification.title}</span>
                        {!notification.isRead && <span className={s.newLabel}>Новое</span>}
                      </div>

                      <Typography variant={'regular_14'} className={s.notificationMessage}>
                        {notification.message}
                      </Typography>

                      <Typography variant={'small_text'} className={s.notificationTime}>
                        {notification.time}
                      </Typography>
                    </div>

                    {!notification.isRead && (
                      <div className={s.unreadDot} aria-hidden={'true'}></div>
                    )}
                  </div>

                  {index < notifications.length - 1 && (
                    <div className={s.menuDivider} aria-hidden={'true'}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </ScrollAreaRadix>

          {notifications.length === 0 && (
            <div className={s.emptyState}>
              <Typography variant={'regular_14'} className={s.emptyText}>
                Нет новых уведомлений
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
