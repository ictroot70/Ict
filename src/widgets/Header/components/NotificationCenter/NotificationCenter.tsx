'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNotificationCenter } from '@/features/notifications/model/useNotificationsCenter'
import {
  Notification,
  NotificationButton,
} from '@/widgets/Header/components/NotificationButton/NotificationButton'

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()

  if (Number.isNaN(date)) {
    return ''
  }

  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) {
    return 'только что'
  }
  if (diffMin < 60) {
    return `${diffMin} мин назад`
  }
  if (diffHr < 24) {
    return `${diffHr} ч назад`
  }

  return `${diffDay} дн назад`
}

export const NotificationCenter = () => {
  const {
    items,
    unreadCount,
    isLoading,
    isLoadingMore,
    isError,
    hasMore,
    loadMore,
    markAllVisibleAsRead,
  } = useNotificationCenter()

  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)

      if (open) {
        markAllVisibleAsRead()
      }
    },
    [markAllVisibleAsRead]
  )

  const notifications = useMemo<Notification[]>(() => {
    if (isLoading) {
      return []
    }

    return items.map(item => ({
      id: item.id,
      title: '',
      message: item.message,
      time: formatTimeAgo(item.notifyAt ?? item.createdAt),
      isRead: item.isRead,
    }))
  }, [items, isLoading])

  if (isLoading) {
    return (
      <NotificationButton
        notifications={[]}
        unreadCount={0}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      />
    )
  }

  if (isError) {
    return (
      <NotificationButton
        notifications={[]}
        unreadCount={0}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      />
    )
  }

  return (
    <NotificationButton
      notifications={notifications}
      unreadCount={unreadCount}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onLoadMore={loadMore}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
    />
  )
}
