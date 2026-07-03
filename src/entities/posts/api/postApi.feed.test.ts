/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { LikeStatus } from '@/shared/types'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { postApi } from './postApi'
import { FOLLOWERS_FEED_QUERY_ARGS } from './posts.constants'
import { FollowersFeedResponse, PostViewModel } from './posts.types'

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

const createPage = ({ nextCursor, page }: { nextCursor: null | number; page: number }) => ({
  totalCount: 2,
  pagesCount: 2,
  page,
  pageSize: 1,
  prevCursor: 0,
  nextCursor,
  items: [],
})

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

const createFollowersFeedPage = (items: PostViewModel[]): FollowersFeedResponse => ({
  items,
  nextCursor: null,
  page: 1,
  pagesCount: 1,
  pageSize: FOLLOWERS_FEED_QUERY_ARGS.pageSize,
  prevCursor: 0,
  totalCount: items.length,
})

const currentUser = {
  userId: 30,
  userName: 'current-user',
  avatarUrl: '/current-avatar.png',
}

const upsertFeedPosts = (store: ReturnType<typeof createTestStore>, posts: PostViewModel[]) =>
  store.dispatch(
    postApi.util.upsertQueryData('getFollowersFeed', FOLLOWERS_FEED_QUERY_ARGS, {
      pageParams: [{ endCursorPostId: 0, pageNumber: 1 }],
      pages: [createFollowersFeedPage(posts)],
    })
  )

const selectFeedPost = (store: ReturnType<typeof createTestStore>, postId: number) =>
  postApi.endpoints.getFollowersFeed
    .select(FOLLOWERS_FEED_QUERY_ARGS)(store.getState())
    .data?.pages[0]?.items.find(post => post.id === postId)

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postApi followers feed', () => {
  it('uses the server cursor when fetching the next page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(asJsonResponse(createPage({ nextCursor: 77, page: 1 })))
      .mockResolvedValueOnce(asJsonResponse(createPage({ nextCursor: null, page: 2 })))
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(postApi.endpoints.getFollowersFeed.initiate({ pageSize: 1 }))
    await store.dispatch(
      postApi.endpoints.getFollowersFeed.initiate(
        { pageSize: 1 },
        { direction: 'forward', subscribe: false }
      )
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstUrl = new URL(asRequest(fetchMock.mock.calls[0]).url)
    const secondUrl = new URL(asRequest(fetchMock.mock.calls[1]).url)

    expect(firstUrl.pathname).toContain(API_ROUTES.HOME.PUBLICATIONS_FOLLOWERS)
    expect(firstUrl.searchParams.get('pageSize')).toBe('1')
    expect(firstUrl.searchParams.get('pageNumber')).toBe('1')
    expect(firstUrl.searchParams.get('endCursorPostId')).toBe('0')

    expect(secondUrl.searchParams.get('pageNumber')).toBe('2')
    expect(secondUrl.searchParams.get('endCursorPostId')).toBe('77')
  })

  it('optimistically updates the followers feed cache after a like', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await upsertFeedPosts(store, [createPost({ id: 1 }), createPost({ id: 2 })])

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const updatedPost = selectFeedPost(store, 1)
    const untouchedPost = selectFeedPost(store, 2)

    expect(updatedPost?.isLiked).toBe(true)
    expect(updatedPost?.likesCount).toBe(3)
    expect(updatedPost?.avatarWhoLikes).toEqual(['/current-avatar.png', '/oldest.png'])
    expect(untouchedPost?.isLiked).toBe(false)
    expect(untouchedPost?.likesCount).toBe(2)
  })

  it('does not increment the followers feed count when the post is already liked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await upsertFeedPosts(store, [
      createPost({
        avatarWhoLikes: ['/current-avatar.png', '/oldest.png'],
        id: 1,
        isLiked: true,
        likesCount: 3,
      }),
    ])

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const updatedPost = selectFeedPost(store, 1)

    expect(updatedPost?.isLiked).toBe(true)
    expect(updatedPost?.likesCount).toBe(3)
    expect(updatedPost?.avatarWhoLikes).toEqual(['/current-avatar.png', '/oldest.png'])
  })

  it('replaces an existing current user avatar variant in the followers feed preview', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await upsertFeedPosts(store, [
      createPost({
        avatarWhoLikes: ['/current-avatar-192.png', '/oldest.png'],
        id: 1,
        isLiked: false,
      }),
    ])

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser: {
          ...currentUser,
          avatarUrls: ['/current-avatar.png', '/current-avatar-192.png'],
        },
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const updatedPost = selectFeedPost(store, 1)

    expect(updatedPost?.avatarWhoLikes).toEqual(['/current-avatar.png', '/oldest.png'])
  })

  it('optimistically removes a like from the followers feed cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asNoContentResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await upsertFeedPosts(store, [
      createPost({
        avatarWhoLikes: ['/current-avatar.png', '/oldest.png'],
        id: 1,
        isLiked: true,
        likesCount: 3,
      }),
    ])

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.NONE },
      })
    )

    const updatedPost = selectFeedPost(store, 1)

    expect(updatedPost?.isLiked).toBe(false)
    expect(updatedPost?.likesCount).toBe(2)
    expect(updatedPost?.avatarWhoLikes).toEqual(['/oldest.png'])
  })

  it('rolls back the followers feed optimistic update when the like request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(asErrorResponse())
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await upsertFeedPosts(store, [createPost({ id: 1 })])

    await store.dispatch(
      postApi.endpoints.updateLikeStatus.initiate({
        postId: 1,
        ownerId: 10,
        currentUser,
        data: { likeStatus: LikeStatus.LIKE },
      })
    )

    const updatedPost = selectFeedPost(store, 1)

    expect(updatedPost?.isLiked).toBe(false)
    expect(updatedPost?.likesCount).toBe(2)
    expect(updatedPost?.avatarWhoLikes).toEqual(['/oldest.png'])
  })
})
