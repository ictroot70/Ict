/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { LikeStatus } from '@/shared/types'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { commentsApi } from './postCommentsApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
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

describe('commentsApi updateCommentLikeStatus', () => {
  it('sends like request for comment', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      commentsApi.endpoints.updateCommentLikeStatus.initiate({
        postId: 1,
        commentId: 10,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])

    expect(request.url).toContain(API_ROUTES.POSTS.LIKE_STATUS_COMMENT(1, 10))
    expect(request.method).toBe('PUT')
    await expect(request.text()).resolves.toBe(JSON.stringify({ likeStatus: LikeStatus.LIKE }))
  })

  it('rolls back optimistic update on error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asErrorResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    // Setup initial cache
    await store.dispatch(
      commentsApi.util.upsertQueryData(
        'getPostComments',
        { postId: 1 },
        {
          pages: [
            {
              items: [
                {
                  id: 10,
                  isLiked: false,
                  likeCount: 0,
                  content: 'test',
                  createdAt: '2026-06-10',
                  from: { id: 1, userName: 'user', avatars: [] },
                  postId: 1,
                  answerCount: 0,
                },
              ],
              pageSize: 12,
              totalCount: 1,
            },
          ],
          pageParams: [1],
        }
      )
    )

    await store.dispatch(
      commentsApi.endpoints.updateCommentLikeStatus.initiate({
        postId: 1,
        commentId: 10,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const cache = commentsApi.endpoints.getPostComments.select({ postId: 1 })(store.getState()).data
    const comment = cache?.pages[0]?.items.find(item => item.id === 10)

    expect(comment?.isLiked).toBe(false)
    expect(comment?.likeCount).toBe(0)
  })
})

describe('commentsApi updateAnswerLikeStatus', () => {
  it('sends like request for answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(
      commentsApi.endpoints.updateAnswerLikeStatus.initiate({
        postId: 1,
        commentId: 10,
        answerId: 20,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const request = asRequest(fetchMock.mock.calls[0])

    expect(request.url).toContain(API_ROUTES.POSTS.LIKE_STATUS_ANSWER(1, 10, 20))
    expect(request.method).toBe('PUT')
  })
})
