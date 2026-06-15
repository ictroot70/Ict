'use client'

import { useCallback, useRef, useState } from 'react'

import { useMarkAsReadBatch } from '@/features/notifications/model/useMarkAsReadBatch'
import { useNotificationsCenter } from '@/features/notifications/model/useNotificationsCenter'
import { useSeenTracker } from '@/features/notifications/model/useSeenTracker'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { useAuthSessionHintContext } from '@/shared/auth'
import { NotificationViewDto } from '@/shared/types/notifications/notification.models'
import { AuthBtn } from '@/widgets/Header/components/AuthBtn'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton'
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
  const { hasAuthHint } = useAuthSessionHintContext()

  const effectiveStatus = status === 'guest' && hasAuthHint ? 'loading' : status
  const isAuthenticated = effectiveStatus === 'authenticated'

  const { items, unreadCount, isLoading, onLoadMore, onMarkAsRead } =
    useNotificationsCenter(isAuthenticated)

  const [isOpen, setIsOpen] = useState(false)
  const itemRefsMap = useRef<Map<number, HTMLElement>>(new Map())
  const unreadIds = items.filter(item => !item.isRead).map(item => item.id)

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

  if (effectiveStatus === 'loading') {
    leadingControl = <HeaderSkeleton />
  } else if (effectiveStatus === 'authenticated') {
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
      {effectiveStatus === 'guest' && <AuthBtn />}
    </>
  )
}
