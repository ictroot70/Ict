import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useNotificationCenter } from '@/features/notifications/model/useNotificationsCenter'
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll'
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
 * @property {number} [unreadCount] - Number of unread notifications
 * @property {boolean} [isOpen] - Controlled open state
 * @property {(open: boolean) => void} [onOpenChange] - Open state change callback
 * @property {() => void} [onLoadMore] - Load more notifications callback
 * @property {boolean} [isLoadingMore] - Whether more notifications are loading
 * @property {boolean} [hasMore] - Whether there are more notifications to load
 */

interface NotificationButtonProps {
  notifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  className?: string
  unreadCount?: number
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onLoadMore?: () => void
  isLoadingMore?: boolean
  hasMore?: boolean
}

export const NotificationButton = ({
  notifications = [],
  onNotificationClick,
  className,
  unreadCount = 0,
  isOpen: controlledOpen,
  onOpenChange,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
}: NotificationButtonProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isMenuOpen = isControlled ? controlledOpen : internalOpen

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isOpeningRef = useRef(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (!isControlled) {
          setInternalOpen(false)
        }
        onOpenChange?.(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isControlled, onOpenChange])

  // Infinite scroll sentinel
  const { observerRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    onLoadMore: onLoadMore ?? (() => {}),
  })

  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.appendChild(sentinelRef.current)
    }
  }, [observerRef, isMenuOpen])

  const handleButtonClick = useCallback(() => {
    const next = !isMenuOpen

    if (!isControlled) {
      setInternalOpen(next)
    }
    onOpenChange?.(next)
  }, [isMenuOpen, isControlled, onOpenChange])

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (onNotificationClick) {
        onNotificationClick(notification)
      }
    },
    [onNotificationClick]
  )

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, notification: Notification) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNotificationClick(notification)
      }
    },
    [handleNotificationClick]
  )

  return (
    <div className={`${s.notificationWrapper} ${className || ''}`}>
      <button
        ref={buttonRef}
        className={s.notificationBtn}
        onClick={handleButtonClick}
        title={'Уведомления'}
        aria-expanded={isMenuOpen}
        aria-label={`Уведомления${unreadCount > 0 ? `, непрочитанных: ${unreadCount}` : ''}`}
        type={'button'}
      >
        <BellOutline size={24} notificationCount={unreadCount} />
        {/*{unreadCount > 0 && (*/}
        {/*  <span className={s.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>*/}
        {/*)}*/}
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
                    onKeyDown={e => handleItemKeyDown(e, notification)}
                    role={'button'}
                    tabIndex={0}
                  >
                    <div className={s.notificationContent}>
                      <div className={s.notificationTitle}>
                        <span className={s.titleText}>{notification.message}</span>
                        {!notification.isRead && <span className={s.newLabel}>Новое</span>}
                      </div>

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

              {isLoadingMore && (
                <div className={s.loadingMore}>
                  <Typography variant={'small_text'} className={s.loadingText}>
                    Загрузка...
                  </Typography>
                </div>
              )}

              <div ref={sentinelRef} className={s.scrollSentinel} />
            </div>
          </ScrollAreaRadix>

          {notifications.length === 0 && !isLoadingMore && (
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
