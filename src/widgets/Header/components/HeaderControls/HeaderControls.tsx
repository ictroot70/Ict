'use client'
import { useCallback, useRef, useState } from 'react'

import { useMarkAsReadBatch } from '@/features/notifications/model/useMarkAsReadBatch'
import { useNotificationsCenter } from '@/features/notifications/model/useNotificationsCenter'
import { useSeenTracker } from '@/features/notifications/model/useSeenTracker'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { NotificationViewDto } from '@/shared/types/notifications/notification.models'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'
import { Notification } from '@/widgets/Header/components/NotificationButton/NotificationButton'

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

  const { items, unreadCount, hasMore, isLoading, onLoadMore, onMarkAsRead } =
    useNotificationsCenter(isAuthenticated)

  // Controlled open state — нужен useSeenTracker и useMarkAsReadBatch
  const [isOpen, setIsOpen] = useState(false)

  // B4: ref-map id → DOM-элемент для IntersectionObserver
  const itemRefsMap = useRef<Map<number, HTMLElement>>(new Map())

  // B4: ids непрочитанных для отслеживания
  const unreadIds = items.filter(i => !i.isRead).map(i => i.id)

  // B4: батч mark-as-read — flush при закрытии и debounce 2s
  const { addSeenId, flushNow } = useMarkAsReadBatch({
    isOpen,
    onFlush: useCallback((ids: number[]) => onMarkAsRead(ids), [onMarkAsRead]),
  })

  // B4: IntersectionObserver seen-tracking
  useSeenTracker({
    itemRefs: itemRefsMap,
    unreadIds,
    isOpen,
    onSeen: addSeenId,
  })

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  // B4 fallback: seen по клику когда IntersectionObserver недоступен
  const handleSeenFallback = useCallback(
    (id: number) => {
      addSeenId(id)
      // Немедленный flush при явном действии
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
        hasMore={hasMore}
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
