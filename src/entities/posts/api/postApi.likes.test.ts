/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { LikeStatus } from '@/shared/types'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { POST_LIKES_QUERY_ARG, postApi } from './postApi'
import { PaginatedPosts, PostLikesResponse, PostViewModel } from './posts.types'

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
  likesCount: 2,
  isLiked: false,
  avatarWhoLikes: ['/oldest.png'],
  ...overrides,
})

const createPostLikes = (): PostLikesResponse => ({
  pageSize: POST_LIKES_QUERY_ARG.pageSize,
  totalCount: 2,
  items: [
    {
      id: 20,
      userId: 20,
      userName: 'other-user',
      createdAt: '2026-06-09T00:00:00.000Z',
      avatars: [{ url: '/other-avatar.png', width: 45, height: 45, fileSize: 10 }],
      isFollowing: false,
      isFollowedBy: false,
    },
  ],
})

const currentUser = {
  userId: 30,
  userName: 'current-user',
  avatarUrl: '/current-avatar.png',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postApi updateLikeStatus optimistic cache updates', () => {
  it('optimistically updates post details and sends the like request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await store.dispatch(postApi.util.upsertQueryData('getPostById', 1, createPost()))

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const post = postApi.endpoints.getPostById.select(1)(store.getState()).data
    const request = asRequest(fetchMock.mock.calls[0])

    expect(request.url).toContain(API_ROUTES.POSTS.LIKE_STATUS_POST(1))
    expect(request.method).toBe('PUT')
    await expect(request.text()).resolves.toBe(JSON.stringify({ likeStatus: LikeStatus.LIKE }))
    expect(post?.isLiked).toBe(true)
    expect(post?.likesCount).toBe(3)
    expect(post?.avatarWhoLikes).toEqual(['/current-avatar.png', '/oldest.png'])
  })

  it('optimistically updates the owner infinite posts cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()
    const firstPage: PaginatedPosts = {
      items: [createPost({ id: 1 }), createPost({ id: 2, likesCount: 5 })],
      pageSize: 8,
      totalCount: 2,
    }

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await store.dispatch(
      postApi.util.upsertQueryData(
        'getInfinitePostsByUser',
        { userId: 10 },
        { pageParams: [null], pages: [firstPage] }
      )
    )

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const postsCache = postApi.endpoints.getInfinitePostsByUser.select({ userId: 10 })(
      store.getState()
    ).data
    const updatedPost = postsCache?.pages[0]?.items.find(post => post.id === 1)
    const untouchedPost = postsCache?.pages[0]?.items.find(post => post.id === 2)

    expect(updatedPost?.isLiked).toBe(true)
    expect(updatedPost?.likesCount).toBe(3)
    expect(updatedPost?.avatarWhoLikes).toEqual(['/current-avatar.png', '/oldest.png'])
    expect(untouchedPost?.likesCount).toBe(5)
  })

  it('updates post likes without duplicating the current user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()
    const existingLikes = createPostLikes()

    existingLikes.totalCount = 3
    existingLikes.items.unshift({
      id: currentUser.userId,
      userId: currentUser.userId,
      userName: currentUser.userName,
      createdAt: '2026-06-08T00:00:00.000Z',
      avatars: [{ url: currentUser.avatarUrl, width: 45, height: 45, fileSize: 10 }],
      isFollowing: false,
      isFollowedBy: false,
    })

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await store.dispatch(
      postApi.util.upsertQueryData(
        'getPostLikes',
        { postId: 1, ...POST_LIKES_QUERY_ARG },
        existingLikes
      )
    )

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const likes = postApi.endpoints.getPostLikes.select({ postId: 1, ...POST_LIKES_QUERY_ARG })(
      store.getState()
    ).data

    expect(likes?.totalCount).toBe(3)
    expect(likes?.items.filter(item => item.userId === currentUser.userId)).toHaveLength(1)
    expect(likes?.items[0]?.userId).toBe(currentUser.userId)
  })

  it('optimistically removes a like from post details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await store.dispatch(
      postApi.util.upsertQueryData(
        'getPostById',
        1,
        createPost({
          avatarWhoLikes: ['/current-avatar.png', '/other-avatar.png'],
          isLiked: true,
          likesCount: 2,
        })
      )
    )

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.NONE },
      })
    )

    const post = postApi.endpoints.getPostById.select(1)(store.getState()).data

    expect(post?.isLiked).toBe(false)
    expect(post?.likesCount).toBe(1)
    expect(post?.avatarWhoLikes).toEqual(['/other-avatar.png'])
  })

  it('rolls back optimistic post details when the like request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asErrorResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await store.dispatch(postApi.util.upsertQueryData('getPostById', 1, createPost()))

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const post = postApi.endpoints.getPostById.select(1)(store.getState()).data

    expect(post?.isLiked).toBe(false)
    expect(post?.likesCount).toBe(2)
    expect(post?.avatarWhoLikes).toEqual(['/oldest.png'])
  })
})
