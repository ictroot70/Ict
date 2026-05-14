import React, { useCallback, useEffect, useRef, useState } from 'react'

import { BellOutline, ScrollAreaRadix, Typography } from '@/shared/ui'

import s from './NotificationButton.module.scss'

import { Notification, NotificationItem } from './NotificationItem'

interface NotificationButtonProps {
  notifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  className?: string
  unreadCount?: number
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onLoadMore?: () => void
  isLoading?: boolean
  hasMore?: boolean
  onSeenFallback?: (id: number) => void
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
        type={'button'}
      >
        <BellOutline size={24} notificationCount={unreadCount} />
      </button>

      {isMenuOpen && (
        <div className={s.notificationMenu} ref={menuRef}>
          <div className={s.beak} aria-hidden={'true'}></div>

          <div className={s.menuHeader}>
            <Typography variant={'h3'} className={s.menuTitle}>
              Notifications
            </Typography>
          </div>

          <div className={s.menuDivider} aria-hidden={'true'}></div>

          <ScrollAreaRadix
            className={s.notificationsScrollArea}
            viewportClassName={s.notificationsViewport}
          >
            <div className={s.notificationsList} ref={scrollRef} onScroll={handleScroll}>
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onKeyDown={handleKeyDown}
                  setItemRef={setItemRef}
                  isLast={index === notifications.length - 1}
                />
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
