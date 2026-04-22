import type {
  NotificationSocketPayload,
  NotificationViewDto,
} from '@/shared/types/notifications/notification.models'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useAppDispatch } from '@/app/store'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { useNotificationsSocket } from '@/features/notifications/model/useNotificationsSocket'
import { logger } from '@/shared/lib/logger'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000
const INITIAL_CURSOR = '0'

function isWithinOneMonth(dateStr: string): boolean {
  const date = new Date(dateStr).getTime()

  if (Number.isNaN(date)) {
    return false
  }
  const cutoff = Date.now() - MONTH_MS

  return date >= cutoff
}

function dedupeAppendNew(newItems: NotificationViewDto[], existing: NotificationViewDto[]) {
  const existingIds = new Set(existing.map(i => i.id))

  return newItems.filter(i => !existingIds.has(i.id))
}

export interface UseNotificationsCenterReturn {
  items: NotificationViewDto[]
  unreadCount: number
  isLoading: boolean
  isLoadingMore: boolean
  isInitialized: boolean
  isError: boolean
  hasMore: boolean
  loadMore: () => void
  markAllVisibleAsRead: () => void
}

export function useNotificationCenter(): UseNotificationsCenterReturn {
  const [items, setItems] = useState<NotificationViewDto[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const monthCutoffReachedRef = useRef(false)
  const nextCursorRef = useRef<string>(INITIAL_CURSOR)

  // Compute unreadCount from items instead of separate state to avoid drift
  const unreadCount = items.filter(i => !i.isRead).length

  // Bootstrap: fetch first page
  const { data, isLoading, isFetching, isError } =
    notificationsApi.useGetNotificationsByCursorQuery(nextCursorRef.current, {
      skip: nextCursorRef.current !== INITIAL_CURSOR,
    })

  // Process initial response
  useEffect(() => {
    if (!data || nextCursorRef.current !== INITIAL_CURSOR) {
      return
    }

    const fresh = data.items.filter(item => isWithinOneMonth(item.notifyAt ?? item.createdAt))

    setItems(fresh)

    if (fresh.length === 0 || fresh.length < data.items.length) {
      // Mixed or all-old page → stop further pagination
      monthCutoffReachedRef.current = true
      setHasMore(false)
    } else if (data.items.length < data.pageSize) {
      setHasMore(false)
    }

    setIsInitialized(true)

    // Prepare next cursor from last item id
    if (data.items.length > 0) {
      nextCursorRef.current = String(data.items[data.items.length - 1].id)
    }
  }, [data])

  // Load more
  const { data: moreData, isFetching: isFetchingMore } =
    notificationsApi.useGetNotificationsByCursorQuery(nextCursorRef.current, {
      skip: nextCursorRef.current === INITIAL_CURSOR || !isLoadingMore,
    })

  useEffect(() => {
    if (!moreData || !isLoadingMore) {
      return
    }

    const fresh = moreData.items.filter(item => isWithinOneMonth(item.notifyAt ?? item.createdAt))

    if (fresh.length === 0 || fresh.length < moreData.items.length) {
      // Mixed or all-old page
      monthCutoffReachedRef.current = true
      setHasMore(false)
      // Still append fresh items from a mixed page
      setItems(prev => [...prev, ...dedupeAppendNew(fresh, prev)])
    } else {
      setItems(prev => [...prev, ...dedupeAppendNew(fresh, prev)])

      if (fresh.length < moreData.pageSize) {
        setHasMore(false)
      }
    }

    setIsLoadingMore(false)

    if (moreData.items.length > 0) {
      nextCursorRef.current = String(moreData.items[moreData.items.length - 1].id)
    }
  }, [moreData, isLoadingMore])

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || monthCutoffReachedRef.current || isFetchingMore) {
      return
    }
    if (nextCursorRef.current === INITIAL_CURSOR) {
      return
    }
    setIsLoadingMore(true)
  }, [isLoadingMore, hasMore, isFetchingMore])

  const dispatch = useAppDispatch()

  // Mark all visible unread items as read
  const markAllVisibleAsRead = useCallback(async () => {
    const unreadIds = items.filter(i => !i.isRead).map(i => i.id)

    if (unreadIds.length === 0) {
      return
    }

    try {
      await dispatch(
        notificationsApi.endpoints.markNotificationsAsRead.initiate({
          ids: unreadIds,
        })
      ).unwrap()

      // Optimistically mark items as read locally; unreadCount is computed below
      setItems(prev => prev.map(i => ({ ...i, isRead: true })))
    } catch (error) {
      logger.error('[useNotificationCenter] mark-as-read failed:', error)
      // Do not commit optimistic update on error (per plan §6.5)
    }
  }, [items, dispatch])

  // Socket: realtime new notifications
  const { onNewNotification } = useNotificationsSocket()

  useEffect(() => {
    const removeHandler = onNewNotification((payload: NotificationSocketPayload) => {
      const newDto: NotificationViewDto = {
        id: payload.id,
        message: payload.message,
        isRead: payload.isRead,
        notifyAt: payload.notifyAt,
        createdAt: payload.notifyAt,
      }

      setItems(prev => {
        if (prev.find(i => i.id === newDto.id)) {
          return prev
        } // dedupe

        return [newDto, ...prev]
      })
    })

    return removeHandler
  }, [onNewNotification])

  return {
    items,
    unreadCount,
    isLoading: isLoading || isFetching,
    isLoadingMore,
    isInitialized,
    isError,
    hasMore,
    loadMore: handleLoadMore,
    markAllVisibleAsRead,
  }
}
