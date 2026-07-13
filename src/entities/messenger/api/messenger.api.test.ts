/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { messengerApi } from './messenger.api'

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
  })

const emptyResponse = {
  pageSize: 12,
  totalCount: 0,
  notReadCount: 0,
  items: [],
}

const asJsonResponse = () =>
  new Response(JSON.stringify(emptyResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const asNoContentResponse = () => new Response(null, { status: 204 })

const asRequest = (call: unknown[]) => {
  const [input, init] = call as [Request | URL | string, RequestInit | undefined]

  if (input instanceof Request) {
    return input
  }

  return new Request(String(input), init)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('messengerApi', () => {
  it('requests messenger dialogs with query parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asJsonResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      messengerApi.endpoints.getMessengerDialogs.initiate({
        cursor: 10,
        pageSize: 20,
        searchName: 'anna',
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])
    const url = new URL(request.url)

    expect(url.pathname.endsWith(API_ROUTES.MESSENGER.BASE)).toBe(true)
    expect(request.method).toBe('GET')
    expect(url.searchParams.get('cursor')).toBe('10')
    expect(url.searchParams.get('pageSize')).toBe('20')
    expect(url.searchParams.get('searchName')).toBe('anna')
  })

  it('requests messages of a selected dialogue', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asJsonResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      messengerApi.endpoints.getDialogueMessages.initiate({
        dialoguePartnerId: 7,
        cursor: 25,
        pageSize: 12,
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])
    const url = new URL(request.url)
    const expectedPath = API_ROUTES.MESSENGER.DIALOGUE('7')

    expect(url.pathname.endsWith(expectedPath)).toBe(true)
    expect(request.method).toBe('GET')
    expect(url.searchParams.get('cursor')).toBe('25')
    expect(url.searchParams.get('pageSize')).toBe('12')
    expect(url.searchParams.has('dialoguePartnerId')).toBe(false)
  })

  it('marks messages as read', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      messengerApi.endpoints.markMessagesAsRead.initiate({
        ids: [1, 2, 3],
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])
    const url = new URL(request.url)

    expect(url.pathname.endsWith(API_ROUTES.MESSENGER.BASE)).toBe(true)
    expect(request.method).toBe('PUT')
    await expect(request.json()).resolves.toEqual({
      ids: [1, 2, 3],
    })
  })

  it('deletes a message by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(messengerApi.endpoints.deleteMessage.initiate(15))

    const request = asRequest(fetchMock.mock.calls[0])
    const url = new URL(request.url)
    const expectedPath = API_ROUTES.MESSENGER.DELETE_MESSAGE(15)

    expect(url.pathname.endsWith(expectedPath)).toBe(true)
    expect(request.method).toBe('DELETE')
    expect(request.body).toBeNull()
  })
})
