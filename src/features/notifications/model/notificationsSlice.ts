import {
  NotificationsPageDto,
  NotificationViewDto,
} from '@/shared/types/notifications/notification.models'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const BOOTSTRAP_CURSOR = '0'
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

function isWithinOneMonth(notifyAt: string): boolean {
  return Date.now() - new Date(notifyAt).getTime() <= ONE_MONTH_MS
}

interface NotificationsState {
  items: NotificationViewDto[]
  /** B1: источник истины для badge — берётся из notReadCount API */
  serverUnreadCount: number
  cursor: string
  hasMore: boolean
  bootstrapCursor: string
  isLoading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  serverUnreadCount: 0,
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
      const { items: incoming, notReadCount } = action.payload

      // B1: обновляем serverUnreadCount только если notReadCount non-null
      if (notReadCount !== null && notReadCount !== undefined) {
        state.serverUnreadCount = notReadCount
      }

      // Month cutoff + dedupe
      const freshItems = incoming.filter(item => isWithinOneMonth(item.notifyAt))
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

    setServerUnreadCount(state, action: PayloadAction<number | null>) {
      if (action.payload !== null && action.payload !== undefined) {
        state.serverUnreadCount = action.payload
      }
    },

    mergeRealtimeItem(state, action: PayloadAction<NotificationViewDto>) {
      const exists = state.items.some(i => i.id === action.payload.id)

      if (!exists) {
        state.items = [action.payload, ...state.items]
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
