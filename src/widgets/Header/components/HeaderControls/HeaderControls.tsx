'use client'
import { useCallback, useRef, useState } from 'react'

import { useMarkAsReadBatch } from '@/features/notifications/model/useMarkAsReadBatch'
import { useNotificationsCenter } from '@/features/notifications/model/useNotificationsCenter'
import { useSeenTracker } from '@/features/notifications/model/useSeenTracker'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { NotificationViewDto } from '@/shared/types/notifications/notification.models'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'
import { NotificationUiModel as Notification } from '@/widgets/Header/components/NotificationButton/NotificationItem'

import { HeaderSkeleton } from './HeaderSkeleton'

function toUiNotification(item: NotificationViewDto): Notification {
  return {
    id: item.id,
    message: item.message,
    isRead: item.isRead,
    time: item.notifyAt,
  }
}

export const HeaderControls = () => {
  const { status } = useAuthUiState()
  const isAuthenticated = status === 'authenticated'

  const { items, unreadCount, isLoading, onLoadMore, onMarkAsRead } =
    useNotificationsCenter(isAuthenticated)

  const [isOpen, setIsOpen] = useState(false)

  const itemRefsMap = useRef<Map<number, HTMLElement>>(new Map())

  const unreadIds = items.filter(i => !i.isRead).map(i => i.id)

  const { addSeenId, flushNow } = useMarkAsReadBatch({
    isOpen,
    onFlush: useCallback((ids: number[]) => onMarkAsRead(ids), [onMarkAsRead]),
  })

  useSeenTracker({
    itemRefs: itemRefsMap,
    unreadIds,
    isOpen,
    onSeen: addSeenId,
  })

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const handleSeenFallback = useCallback(
    (id: number) => {
      addSeenId(id)
      void flushNow()
    },
    [addSeenId, flushNow]
  )

  let leadingControl = null

  if (status === 'loading') {
    leadingControl = <HeaderSkeleton />
  } else if (status === 'authenticated') {
    leadingControl = (
      <NotificationButton
        notifications={items.map(toUiNotification)}
        unreadCount={unreadCount}
        isLoading={isLoading}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onLoadMore={onLoadMore}
        onSeenFallback={handleSeenFallback}
        itemRefsMap={itemRefsMap}
      />
    )
  }

  return (
    <>
      {leadingControl}
      <LanguageSelect />
      {status === 'guest' && <AuthBtn />}
    </>
  )
}
