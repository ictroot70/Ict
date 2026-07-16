/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { postApi } from './postApi'
import { PostViewModel } from './posts.types'

const createTestStore = () =>
  configureStore({
    reducer: {
      [postApi.reducerPath]: postApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(postApi.middleware),
  })

const asJsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const asErrorResponse = () =>
  new Response(JSON.stringify({ message: 'Request failed' }), {
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

const createPost = (overrides: Partial<PostViewModel> = {}): PostViewModel => ({
  id: 1,
  userName: 'owner',
  description: 'description',
  images: [],
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-10T00:00:00.000Z',
  ownerId: 10,
  avatarOwner: '/owner-avatar.png',
  owner: { firstName: 'Post', lastName: 'Owner' },
  likesCount: 3,
  isLiked: true,
  avatarWhoLikes: ['/current-avatar.png'],
  ...overrides,
})

const createdComment = {
  id: 100,
  postId: 1,
  content: 'new comment',
  createdAt: '2026-06-11T00:00:00.000Z',
  likeCount: 0,
  isLiked: false,
  answerCount: 0,
  from: {
    id: 30,
    userName: 'current-user',
    avatars: [],
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postApi createComment cache invalidation', () => {
  it('does not refetch post details after creating a comment', async () => {
    const fetchMock = vi.fn((...call: Parameters<typeof fetch>) => {
      const request = asRequest(call)

      if (request.url.includes(API_ROUTES.POSTS.BY_ID(1))) {
        return Promise.resolve(asJsonResponse(createPost()))
      }

      if (request.url.includes(API_ROUTES.POSTS.COMMENTS(1))) {
        return Promise.resolve(asJsonResponse(createdComment))
      }

      return Promise.resolve(asErrorResponse())
    })
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    const postSubscription = store.dispatch(postApi.endpoints.getPostById.initiate(1))

    await postSubscription
    await store.dispatch(
      postApi.endpoints.createComment.initiate({
        postId: 1,
        body: { content: 'new comment' },
      })
    )
    postSubscription.unsubscribe()

    const postRequests = fetchMock.mock.calls.filter(call =>
      asRequest(call).url.includes(API_ROUTES.POSTS.BY_ID(1))
    )

    expect(postRequests).toHaveLength(1)
  })
})
