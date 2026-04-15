import type { UpdateNotificationIsReadDto } from '@/shared/types/notifications/notification.models'

import { API_ROUTES } from '@/shared/api'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { notificationsApi } from './notificationsApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [notificationsApi.reducerPath]: notificationsApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(notificationsApi.middleware),
  })

const asJsonResponse = (body: unknown, status: number = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const asNoContentResponse = () =>
  new Response(null, {
    status: 204,
  })

const asRequest = (call: unknown[]) => {
  const [input, init] = call as [Request | URL | string, Record<string, unknown> | undefined]

  if (input instanceof Request) {
    return input
  }

  return new Request(String(input), init as ConstructorParameters<typeof Request>[1])
}

const sampleNotifications = [
  {
    id: 1,
    message: 'Test notification 1',
    isRead: false,
    notifyAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    message: 'Test notification 2',
    isRead: true,
    notifyAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

describe('notificationsApi', () => {
  describe('getNotificationsByCursor', () => {
    it('calls the correct endpoint with cursor and sort params', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        asJsonResponse({
          pageSize: 10,
          totalCount: 2,
          notReadCount: 1,
          items: sampleNotifications,
        })
      )
      const store = createTestStore()

      vi.stubGlobal('fetch', fetchMock as typeof fetch)

      await store.dispatch(notificationsApi.endpoints.getNotificationsByCursor.initiate('0'))

      expect(fetchMock).toHaveBeenCalledTimes(1)

      const request = asRequest(fetchMock.mock.calls[0])
      const requestUrl = new URL(request.url)

      expect(requestUrl.pathname).toContain('notifications/0')
      expect(requestUrl.searchParams.get('sortBy')).toBe('notifyAt')
      expect(requestUrl.searchParams.get('sortDirection')).toBe('desc')
    })
  })

  describe('markNotificationsAsRead', () => {
    it('sends PUT request with ids body', async () => {
      const fetchMock = vi.fn().mockResolvedValue(asJsonResponse({}, 202))
      const store = createTestStore()
      const payload: UpdateNotificationIsReadDto = { ids: [1, 2] }

      vi.stubGlobal('fetch', fetchMock as typeof fetch)

      await store.dispatch(notificationsApi.endpoints.markNotificationsAsRead.initiate(payload))

      expect(fetchMock).toHaveBeenCalledTimes(1)

      const request = asRequest(fetchMock.mock.calls[0])

      expect(request.url).toContain(API_ROUTES.NOTIFICATIONS.MARK_AS_READ)
      expect(request.method).toBe('PUT')
      await expect(request.text()).resolves.toBe(JSON.stringify(payload))
    })
  })

  describe('deleteNotification', () => {
    it('sends DELETE request for a single notification', async () => {
      const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
      const store = createTestStore()

      vi.stubGlobal('fetch', fetchMock as typeof fetch)

      await store.dispatch(notificationsApi.endpoints.deleteNotification.initiate(42))

      expect(fetchMock).toHaveBeenCalledTimes(1)

      const request = asRequest(fetchMock.mock.calls[0])

      expect(request.url).toContain('notifications/42')
      expect(request.method).toBe('DELETE')
    })
  })
})
