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
  unreadCount: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onLoadMore: () => void
  onMarkAsRead: (ids: number[]) => Promise<void>
  onRefetchFirst: () => void
}

export function useNotificationsCenter(isAuthenticated: boolean): NotificationsCenterResult {
  const dispatch = useAppDispatch()
  const { items, cursor, hasMore, isLoading, error } = useAppSelector(state => state.notifications)
  const unreadCount = useAppSelector(selectVisibleUnreadCount)

  const [triggerGetPage] = notificationsApi.endpoints.getNotificationsByCursor.useLazyQuery()
  const [markAsRead] = notificationsApi.endpoints.markNotificationsAsRead.useMutation()

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
  }, [dispatch, isAuthenticated, triggerGetPage])

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(reset())
    }
  }, [isAuthenticated, dispatch])

  const onRefetchFirst = useCallback(() => {
    triggerGetPage(BOOTSTRAP_CURSOR, false)
      .unwrap()
      .then(page => {
        dispatch(setPageResult(page))
      })
      .catch(() => {})
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
      await markAsRead({ ids }).unwrap()
      dispatch(markItemsAsRead(ids))
      onRefetchFirst()
    },
    [dispatch, markAsRead, onRefetchFirst]
  )

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
      onRefetchFirst()
    },
    [dispatch, onRefetchFirst]
  )

  const handleInvalidPayload = useCallback(() => {
    onRefetchFirst()
  }, [onRefetchFirst])

  const handleAuthError = useCallback(() => {}, [])

  useNotificationsSocket({
    accessToken: isAuthenticated ? (authTokenStorage.getAccessToken() ?? null) : null,
    onNotification: handleWsNotification,
    onInvalidPayload: handleInvalidPayload,
    onAuthError: handleAuthError,
  })

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    error,
    onLoadMore,
    onMarkAsRead,
    onRefetchFirst,
  }
}
