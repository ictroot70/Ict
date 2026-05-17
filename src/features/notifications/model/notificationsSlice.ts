import {
  NotificationsPageDto,
  NotificationViewDto,
} from '@/shared/types/notifications/notification.models'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

const BOOTSTRAP_CURSOR = '0'
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

function isWithinOneMonth(notifyAt: string): boolean {
  return Date.now() - new Date(notifyAt).getTime() <= ONE_MONTH_MS
}

function formatNotificationMessage(message: string): string {
  const subscriptionPattern =
    /Your subscription has been activated and is valid until (\d{2})\/(\d{2})\/(\d{4})\./

  return message.replace(
    subscriptionPattern,
    'Your subscription has been activated and is valid until $2.$1.$3'
  )
}

interface NotificationsState {
  items: NotificationViewDto[]
  cursor: string
  hasMore: boolean
  bootstrapCursor: string
  isLoading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  cursor: BOOTSTRAP_CURSOR,
  hasMore: true,
  bootstrapCursor: BOOTSTRAP_CURSOR,
  isLoading: false,
  error: null,
}

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setPageResult(state, action: PayloadAction<NotificationsPageDto>) {
      const { items: incoming } = action.payload

      // Month cutoff + dedupe
      const freshItems = incoming
        .filter(item => isWithinOneMonth(item.notifyAt))
        .map(item => ({ ...item, message: formatNotificationMessage(item.message) }))
      const existingIds = new Set(state.items.map(i => i.id))
      const newItems = freshItems.filter(i => !existingIds.has(i.id))

      state.items = [...state.items, ...newItems]

      // hasMore: если все incoming старые или смешанная страница — стоп
      const allOld = incoming.length > 0 && freshItems.length === 0
      const mixed = incoming.length > 0 && freshItems.length < incoming.length

      if (allOld || mixed || incoming.length === 0) {
        state.hasMore = false
      }

      // Следующий cursor — id последнего загруженного item
      if (incoming.length > 0) {
        state.cursor = String(incoming[incoming.length - 1].id)
      }
    },

    setServerUnreadCount(_state, _action: PayloadAction<number | null>) {
      // no-op: unread count теперь derived из items (только видимые / month-cutoff)
    },

    mergeRealtimeItem(state, action: PayloadAction<NotificationViewDto>) {
      const exists = state.items.some(i => i.id === action.payload.id)

      if (!exists) {
        state.items = [
          { ...action.payload, message: formatNotificationMessage(action.payload.message) },
          ...state.items,
        ]
      }
    },

    markItemsAsRead(state, action: PayloadAction<number[]>) {
      const ids = new Set(action.payload)

      state.items = state.items.map(item => (ids.has(item.id) ? { ...item, isRead: true } : item))
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },

    reset() {
      return initialState
    },
  },
})

export const {
  setPageResult,
  setServerUnreadCount,
  mergeRealtimeItem,
  markItemsAsRead,
  setLoading,
  setError,
  reset,
} = notificationsSlice.actions

export const notificationsReducer = notificationsSlice.reducer

/**
 * Количество непрочитанных уведомлений среди тех, что видит пользователь
 * (только за последний месяц, после month-cutoff фильтрации в setPageResult).
 * Используется как badge value вместо глобального notReadCount с сервера.
 */
export const selectVisibleUnreadCount = createSelector(
  (state: { notifications: NotificationsState }) => state.notifications.items,
  items => items.filter(i => !i.isRead).length
)
