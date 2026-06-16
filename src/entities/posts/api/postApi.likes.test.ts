/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { LikeStatus } from '@/shared/types'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { postApi } from './postApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [postApi.reducerPath]: postApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(postApi.middleware),
  })

const asNoContentResponse = () =>
  new Response(null, {
    status: 204,
  })

const asErrorResponse = () =>
  new Response(JSON.stringify({ message: 'Like failed' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })

const asRequest = (call: unknown[]) => {
  const [input, init] = call as [Request | URL | string, Record<string, unknown> | undefined]

  if (input instanceof Request) {
    return input
  }

  return new Request(String(input), init as ConstructorParameters<typeof Request>[1])
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postApi updateLikeStatus', () => {
  it('sends the like request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])

    expect(request.url).toContain(API_ROUTES.POSTS.LIKE_STATUS_POST(1))
    expect(request.method).toBe('PUT')
    await expect(request.text()).resolves.toBe(JSON.stringify({ likeStatus: LikeStatus.LIKE }))
  })

  it('sends the unlike request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        data: { likeStatus: LikeStatus.NONE },
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])

    expect(request.url).toContain(API_ROUTES.POSTS.LIKE_STATUS_POST(1))
    expect(request.method).toBe('PUT')
    await expect(request.text()).resolves.toBe(JSON.stringify({ likeStatus: LikeStatus.NONE }))
  })

  it('shows error when like request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asErrorResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const result = await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    expect(result.error).toBeDefined()
  })
})
