import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useNotificationsCenter } from '@/features/notifications/model/useNotificationsCenter'
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll'
import { BellOutline, ScrollAreaRadix, Typography } from '@/shared/ui'

import s from './NotificationButton.module.scss'

export interface Notification {
  id: number
  title?: string
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
  /** B1: badge value — из serverUnreadCount (API notReadCount) */
  unreadCount?: number
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onLoadMore?: () => void
  isLoading?: boolean
  hasMore?: boolean
  /**
   * B4 fallback: вызывается при клике на непрочитанный item
   * когда IntersectionObserver недоступен.
   */
  onSeenFallback?: (id: number) => void
  /** B4: ref-map для IntersectionObserver в useSeenTracker */
  itemRefsMap?: React.RefObject<Map<number, HTMLElement>>
}

export const NotificationButton = ({
  notifications = [],
  onNotificationClick,
  className,
  unreadCount = 0,
  isOpen: controlledOpen,
  onOpenChange,
  onLoadMore,
  isLoading,
  onSeenFallback,
  itemRefsMap,
}: NotificationButtonProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isMenuOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onOpenChangeRef = useRef(onOpenChange)

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  })

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open)
      }
      onOpenChangeRef.current?.(open)
    },
    [controlledOpen]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleOpenChange])

  const handleButtonClick = () => {
    handleOpenChange(!isMenuOpen)
  }

  const handleNotificationClick = (notification: Notification) => {
    // B4 fallback: если IntersectionObserver недоступен — seen по клику
    if (!notification.isRead && typeof IntersectionObserver === 'undefined') {
      onSeenFallback?.(notification.id)
    }
    onNotificationClick?.(notification)
  }

  const handleKeyDown = (e: React.KeyboardEvent, notification: Notification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNotificationClick(notification)
    }
  }

  // Infinite scroll trigger
  const handleScroll = () => {
    const el = scrollRef.current

    if (!el || !onLoadMore) {
      return
    }
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      onLoadMore()
    }
  }

  // B4: регистрируем ref элемента в itemRefsMap для IntersectionObserver
  const setItemRef = useCallback(
    (id: number, el: HTMLElement | null) => {
      if (!itemRefsMap?.current) {
        return
      }
      if (el) {
        itemRefsMap.current.set(id, el)
      } else {
        itemRefsMap.current.delete(id)
      }
    },
    [itemRefsMap]
  )

  return (
    <div className={`${s.notificationWrapper} ${className ?? ''}`}>
      <button
        ref={buttonRef}
        className={s.notificationBtn}
        onClick={handleButtonClick}
        title={'Уведомления'}
        aria-expanded={isMenuOpen}
        aria-label={`Уведомления${unreadCount > 0 ? `, непрочитанных: ${unreadCount}` : ''}`}
        type={'button'}
      >
        <BellOutline size={24} />
        {/* B1: badge отображает serverUnreadCount из API */}
        {unreadCount > 0 && (
          <span className={s.unreadBadge} aria-label={`${unreadCount} непрочитанных`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
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
            <div className={s.notificationsList} ref={scrollRef} onScroll={handleScroll}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <div
                    ref={el => setItemRef(notification.id, el)}
                    data-notification-id={notification.id}
                    className={`${s.notificationItem} ${!notification.isRead ? s.unread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={e => handleKeyDown(e, notification)}
                    role={'button'}
                    tabIndex={0}
                  >
                    <div className={s.notificationContent}>
                      <div className={s.notificationTitle}>
                        {notification.title && (
                          <span className={s.titleText}>{notification.title}</span>
                        )}
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

              {isLoading && (
                <div className={s.loadingState}>
                  <Typography variant={'small_text'}>Загрузка...</Typography>
                </div>
              )}
            </div>
          </ScrollAreaRadix>

          {notifications.length === 0 && !isLoading && (
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
