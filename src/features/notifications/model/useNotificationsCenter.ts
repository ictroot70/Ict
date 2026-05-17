'use client'
import { useCallback, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/store'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import {
  NotificationViewDto,
  WsNotificationPayload,
} from '@/shared/types/notifications/notification.models'

import {
  markItemsAsRead,
  mergeRealtimeItem,
  reset,
  selectVisibleUnreadCount,
  setError,
  setLoading,
  setPageResult,
} from './notificationsSlice'
import { useNotificationsSocket } from './useNotificationsSocket'

const BOOTSTRAP_CURSOR = '0'

export interface NotificationsCenterResult {
  items: NotificationViewDto[]
  /** Количество непрочитанных среди видимых (за последний месяц) */
  unreadCount: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onLoadMore: () => void
  onMarkAsRead: (ids: number[]) => Promise<void>
  onRealtimeNotification: (item: NotificationViewDto) => void
  onRefetchFirst: () => void
}

export function useNotificationsCenter(isAuthenticated: boolean): NotificationsCenterResult {
  const dispatch = useAppDispatch()
  const { items, cursor, hasMore, isLoading, error } = useAppSelector(state => state.notifications)
  const unreadCount = useAppSelector(selectVisibleUnreadCount)

  const [triggerGetPage] = notificationsApi.endpoints.getNotificationsByCursor.useLazyQuery()
  const [markAsRead] = notificationsApi.endpoints.markNotificationsAsRead.useMutation()

  // Загрузка первой страницы при монтировании (authenticated only)
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    dispatch(setLoading(true))
    triggerGetPage(BOOTSTRAP_CURSOR)
      .unwrap()
      .then(page => {
        dispatch(setPageResult(page))
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load notifications'

        dispatch(setError(msg))
      })
      .finally(() => {
        dispatch(setLoading(false))
      })
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Сброс при logout
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(reset())
    }
  }, [isAuthenticated, dispatch])

  // Refetch первой страницы — обновляет items (и derived unreadCount) из API
  const onRefetchFirst = useCallback(() => {
    triggerGetPage(BOOTSTRAP_CURSOR, /* preferCacheValue */ false)
      .unwrap()
      .then(page => {
        dispatch(setPageResult(page))
      })
      .catch(() => {
        // silent — не ломаем UI при фоновом refetch
      })
  }, [dispatch, triggerGetPage])

  const onLoadMore = useCallback(() => {
    if (!hasMore || isLoading) {
      return
    }

    dispatch(setLoading(true))
    triggerGetPage(cursor)
      .unwrap()
      .then(page => {
        dispatch(setPageResult(page))
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load more notifications'

        dispatch(setError(msg))
      })
      .finally(() => {
        dispatch(setLoading(false))
      })
  }, [cursor, hasMore, isLoading, dispatch, triggerGetPage])

  const onMarkAsRead = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) {
        return
      }

      try {
        await markAsRead({ ids }).unwrap()
        // Оптимистичное обновление локального isRead
        dispatch(markItemsAsRead(ids))
        // B1: refetch для синхронизации serverUnreadCount
        onRefetchFirst()
      } catch {
        // B1 req 4.7: при 400/401 не коммитим optimistic update
      }
    },
    [dispatch, markAsRead, onRefetchFirst]
  )

  // B2: WS callback — merge item + refetch для serverUnreadCount
  const handleWsNotification = useCallback(
    (payload: WsNotificationPayload) => {
      dispatch(
        mergeRealtimeItem({
          id: payload.id,
          message: payload.message,
          isRead: payload.isRead,
          notifyAt: payload.notifyAt,
          createdAt: payload.notifyAt,
        })
      )
      // B1 req 1.6: после WS-события refetch для обновления serverUnreadCount
      onRefetchFirst()
    },
    [dispatch, onRefetchFirst]
  )

  // B3: fallback refetch при невалидном WS payload
  const handleInvalidPayload = useCallback(() => {
    onRefetchFirst()
  }, [onRefetchFirst])

  // B2: auth error → logout уже обрабатывается внутри useNotificationsSocket
  const handleAuthError = useCallback(() => {
    // logout dispatched inside useNotificationsSocket
  }, [])

  // B2: Socket.IO lifecycle с auth-aware reconnect
  useNotificationsSocket({
    accessToken: isAuthenticated ? (authTokenStorage.getAccessToken() ?? null) : null,
    onNotification: handleWsNotification,
    onInvalidPayload: handleInvalidPayload,
    onAuthError: handleAuthError,
  })

  const onRealtimeNotification = useCallback(
    (item: NotificationViewDto) => {
      dispatch(mergeRealtimeItem(item))
      onRefetchFirst()
    },
    [dispatch, onRefetchFirst]
  )

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    error,
    onLoadMore,
    onMarkAsRead,
    onRealtimeNotification,
    onRefetchFirst,
  }
}
