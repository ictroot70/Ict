/* eslint-disable max-lines */
import {
  CreatePostInputDto,
  FollowersFeedParams,
  FollowersFeedResponse,
  FollowersFeedPageParams,
  GetPostLikesParams,
  GetPostsByUserParams,
  GetPostsParams,
  PaginatedPosts,
  PaginatedResponse,
  PostImageViewModel,
  PostLikesResponse,
  PostViewModel,
  UpdateLikeStatusDto,
  UpdatePostInputDto,
} from '@/entities/posts/api/posts.types'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { CommentsViewModel, CreateCommentDto } from '@/shared/types/comments'
import { InfiniteData } from '@reduxjs/toolkit/query'

import { FOLLOWERS_FEED_QUERY_ARGS } from './posts.constants'

const isValidUserId = (userId: number) => Number.isInteger(userId) && userId > 0
const DEFAULT_AVATAR = '/default-avatar.svg'
const POST_LIKE_AVATARS_LIMIT = 3

export const POST_LIKES_QUERY_ARG = {
  cursor: 0,
  pageNumber: 1,
  pageSize: 50,
}

type CurrentLikeUser = {
  avatarUrl?: string
  avatarUrls?: string[]
  userId: number
  userName: string
}

type PostLikePatch = {
  avatarUrl: string
  avatarUrls: string[]
  delta: number
  isLike: boolean
}

const getAvatarUrl = (user: PostLikesResponse['items'][number]) =>
  user.avatars.find(avatar => avatar.width === 45)?.url ?? user.avatars[0]?.url ?? DEFAULT_AVATAR

const sortPostLikeUsersByRecent = (items: PostLikesResponse['items']) =>
  [...items].sort((a, b) => {
    const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

    return createdAtDiff || b.id - a.id
  })

export const getAvatarWhoLikes = (likes: PostLikesResponse) =>
  sortPostLikeUsersByRecent(likes.items).slice(0, POST_LIKE_AVATARS_LIMIT).map(getAvatarUrl)

const getUpdatedLikeAvatarUrls = (
  avatarUrls: string[],
  { avatarUrl, avatarUrls: currentUserAvatarUrls, isLike }: PostLikePatch
) => {
  const currentUserAvatarUrlSet = new Set(currentUserAvatarUrls)
  const avatarUrlsWithoutCurrentUser = avatarUrls.filter(url => !currentUserAvatarUrlSet.has(url))

  if (isLike) {
    return [avatarUrl, ...avatarUrlsWithoutCurrentUser].slice(0, POST_LIKE_AVATARS_LIMIT)
  }

  return avatarUrlsWithoutCurrentUser
}

const applyPostLikePatch = (post: PostViewModel, patch: PostLikePatch) => {
  const shouldUpdateCount = post.isLiked !== patch.isLike

  post.isLiked = patch.isLike
  post.likesCount = shouldUpdateCount ? Math.max(0, post.likesCount + patch.delta) : post.likesCount
  post.avatarWhoLikes = getUpdatedLikeAvatarUrls(post.avatarWhoLikes, patch)
}

const applyPostLikePatchToPages = (
  pages: Array<{ items: PostViewModel[] }>,
  postId: number,
  patch: PostLikePatch
) => {
  for (const page of pages) {
    const post = page.items.find(item => item.id === postId)

    if (post) {
      applyPostLikePatch(post, patch)

      return
    }
  }
}

export const postApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createPost: builder.mutation<PostViewModel, { body: CreatePostInputDto; userId: number }>({
      query: ({ body }) => {
        if (body.childrenMetadata.length === 0) {
          throw new Error('At least one image is required')
        }

        const validatedBody = {
          ...body,
          description: body.description || undefined,
        }

        return {
          url: API_ROUTES.POSTS.BASE,
          method: 'POST',
          body: validatedBody,
        }
      },
      invalidatesTags: (result, error, { userId }) => {
        const targetUserId = result?.ownerId ?? userId

        return [
          'Posts',
          'Profile',
          { type: 'Post', id: 'LIST' },
          ...(isValidUserId(targetUserId)
            ? [
                { type: 'UserPosts' as const, id: targetUserId },
                { type: 'Post' as const, id: `USER-${targetUserId}` },
              ]
            : []),
        ]
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: createdPost } = await queryFulfilled

          dispatch(
            postApi.util.updateQueryData(
              'getInfinitePostsByUser',
              { userId: createdPost.ownerId },
              (draft: InfiniteData<PaginatedPosts, null | number>) => {
                if (!draft.pages.length) {
                  return
                }

                const firstPage = draft.pages[0]

                if (firstPage.items.some(post => post.id === createdPost.id)) {
                  return
                }

                firstPage.items.unshift(createdPost)

                for (const page of draft.pages) {
                  page.totalCount += 1
                }

                if (firstPage.items.length > firstPage.pageSize) {
                  firstPage.items = firstPage.items.slice(0, firstPage.pageSize)
                }
              }
            )
          )
        } catch {
          // handled by invalidation/refetch
        }
      },
    }),

    updatePost: builder.mutation<
      PostViewModel,
      { postId: number; body: UpdatePostInputDto; userId: number }
    >({
      query: ({ postId, body }) => ({
        url: API_ROUTES.POSTS.BY_POST_ID(postId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { postId, userId }) => [
        'Posts',
        'Profile',
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        ...(isValidUserId(userId)
          ? [
              { type: 'UserPosts' as const, id: userId },
              { type: 'Post' as const, id: `USER-${userId}` },
            ]
          : []),
      ],
      async onQueryStarted({ postId, body, userId }, { dispatch, queryFulfilled }) {
        if (!isValidUserId(userId)) {
          try {
            await queryFulfilled
          } catch {
            // handled by invalidation/refetch
          }

          return
        }

        const postByIdPatchResult = dispatch(
          postApi.util.updateQueryData('getPostById', postId, draft => {
            if (body.description) {
              draft.description = body.description
              draft.updatedAt = new Date().toISOString()
            }
          })
        )

        const patchResult = dispatch(
          postApi.util.updateQueryData(
            'getInfinitePostsByUser',
            { userId },
            (draft: InfiniteData<PaginatedPosts, null | number>) => {
              for (const page of draft.pages) {
                const post = page.items.find(item => item.id === postId)

                if (post && body.description) {
                  post.description = body.description
                  post.updatedAt = new Date().toISOString()

                  break
                }
              }
            }
          )
        )

        try {
          await queryFulfilled
        } catch {
          postByIdPatchResult.undo()
          patchResult.undo()
        }
      },
    }),

    deletePost: builder.mutation<void, { postId: number; userId: number }>({
      query: ({ postId }) => ({
        url: API_ROUTES.POSTS.BY_POST_ID(postId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId, userId }) => [
        'Posts',
        'Profile',
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        ...(isValidUserId(userId)
          ? [
              { type: 'UserPosts' as const, id: userId },
              { type: 'Post' as const, id: `USER-${userId}` },
            ]
          : []),
      ],
      async onQueryStarted({ postId, userId }, { dispatch, queryFulfilled }) {
        if (!isValidUserId(userId)) {
          try {
            await queryFulfilled
          } catch {
            // handled by invalidation/refetch
          }

          return
        }

        const patchResult = dispatch(
          postApi.util.updateQueryData(
            'getInfinitePostsByUser',
            { userId },
            (draft: InfiniteData<PaginatedPosts, null | number>) => {
              let removedCount = 0

              for (const page of draft.pages) {
                const before = page.items.length

                page.items = page.items.filter(post => post.id !== postId)
                removedCount += before - page.items.length
              }

              if (removedCount > 0) {
                for (const page of draft.pages) {
                  page.totalCount = Math.max(0, page.totalCount - removedCount)
                }
              }
            }
          )
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    createComment: builder.mutation<CommentsViewModel, { postId: number; body: CreateCommentDto }>({
      query: ({ postId, body }) => ({
        url: API_ROUTES.POSTS.CREATE_COMMENT(postId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
        { type: 'Post', id: postId },
      ],
    }),

    uploadImage: builder.mutation<{ images: PostImageViewModel[] }, FormData>({
      query: formData => ({
        url: API_ROUTES.POSTS.IMAGE,
        method: 'POST',
        body: formData,
      }),
    }),

    deleteImage: builder.mutation<void, string>({
      query: uploadId => ({
        url: API_ROUTES.POSTS.DELETE_IMAGE(uploadId),
        method: 'DELETE',
      }),
    }),

    getPostById: builder.query<PostViewModel, number>({
      query: postId => API_ROUTES.POSTS.BY_ID(postId),
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    getPostsByUser: builder.query<PaginatedResponse<PostViewModel>, GetPostsByUserParams>({
      query: ({ userId, endCursorPostId = 0, pageSize = 8, sortDirection = 'desc' }) => ({
        url: API_ROUTES.POSTS.USER_POSTS(userId, endCursorPostId),
        params: { pageSize, sortDirection },
      }),
      providesTags: (result, error, { userId }) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
              { type: 'Post', id: `USER-${userId}` },
            ]
          : [
              { type: 'Post', id: 'LIST' },
              { type: 'Post', id: `USER-${userId}` },
            ],
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.userId}`,
      merge: (currentCache, newItems) => {
        const existingIds = new Set(currentCache.items.map(item => item.id))
        const newUniqueItems = newItems.items.filter(item => !existingIds.has(item.id))

        currentCache.items.push(...newUniqueItems)
        currentCache.items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        currentCache.pageSize = newItems.pageSize
        currentCache.totalCount = newItems.totalCount
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.endCursorPostId !== previousArg?.endCursorPostId,
    }),

    getInfinitePostsByUser: builder.infiniteQuery<
      PaginatedPosts,
      GetPostsByUserParams,
      null | number
    >({
      keepUnusedDataFor: 300,
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: ({ items }) => {
          const expectedPageSize = 8

          if (!items || items.length < expectedPageSize) {
            return null
          }

          const lastItem = items[items.length - 1]

          return lastItem ? lastItem.id : null
        },
      },
      query: ({ pageParam, queryArg }) => {
        const cursorId = pageParam === null ? 0 : pageParam
        const pageSize = queryArg.pageSize ?? (cursorId === 0 ? 8 : 9)

        return {
          url: API_ROUTES.POSTS.USER_POSTS(queryArg.userId, cursorId),
          params: {
            pageSize,
            sortDirection: queryArg.sortDirection ?? 'desc',
          },
        }
      },
      providesTags: (result, error, arg) => ['Posts', { type: 'UserPosts', id: arg.userId }],
    }),

    getPosts: builder.query<PaginatedResponse<PostViewModel>, GetPostsParams>({
      query: ({ param, pageSize = 12, pageNumber = 1, sortDirection = 'desc', sortBy }) => ({
        url: API_ROUTES.POSTS.PARAM(param),
        params: { pageSize, pageNumber, sortDirection, sortBy },
      }),
      providesTags: result =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostLikes: builder.query<PostLikesResponse, GetPostLikesParams>({
      query: ({ postId, pageSize = 3, pageNumber = 1, cursor = 0 }) => ({
        url: API_ROUTES.POSTS.POST_LIKES(postId),
        params: { pageSize, pageNumber, cursor },
      }),
    }),

    updateLikeStatus: builder.mutation<
      void,
      { postId: number; data: UpdateLikeStatusDto; ownerId: number; currentUser: CurrentLikeUser }
    >({
      query: ({ postId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_POST(postId),
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ postId, data, ownerId, currentUser }, { dispatch, queryFulfilled }) {
        const isLike = data.likeStatus === 'LIKE'
        const delta = isLike ? 1 : -1
        const avatarUrl = currentUser.avatarUrl || DEFAULT_AVATAR
        const avatarUrls = Array.from(new Set([avatarUrl, ...(currentUser.avatarUrls ?? [])]))
        const likePatch = { avatarUrl, avatarUrls, delta, isLike }
        const patches: Array<{ undo: () => void }> = []

        patches.push(
          dispatch(
            postApi.util.updateQueryData('getPostById', postId, draft => {
              applyPostLikePatch(draft, likePatch)
            })
          )
        )

        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              'getPostLikes',
              { postId, ...POST_LIKES_QUERY_ARG },
              draft => {
                if (isLike) {
                  const hasCurrentUserLike = draft.items.some(
                    item => item.userId === currentUser.userId
                  )

                  draft.totalCount = Math.max(
                    0,
                    draft.totalCount + (hasCurrentUserLike ? 0 : delta)
                  )
                  draft.items = [
                    {
                      id: currentUser.userId,
                      userId: currentUser.userId,
                      userName: currentUser.userName,
                      createdAt: new Date().toISOString(),
                      avatars: currentUser.avatarUrl
                        ? [
                            {
                              url: currentUser.avatarUrl,
                              width: 45,
                              height: 45,
                              fileSize: 0,
                            },
                          ]
                        : [],
                      isFollowing: false,
                      isFollowedBy: false,
                    },
                    ...draft.items.filter(item => item.userId !== currentUser.userId),
                  ]
                } else {
                  draft.totalCount = Math.max(0, draft.totalCount + delta)
                  draft.items = draft.items.filter(item => item.userId !== currentUser.userId)
                }

                draft.items = sortPostLikeUsersByRecent(draft.items).slice(
                  0,
                  POST_LIKES_QUERY_ARG.pageSize
                )
              }
            )
          )
        )

        if (isValidUserId(ownerId)) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData(
                'getInfinitePostsByUser',
                { userId: ownerId },
                (draft: InfiniteData<PaginatedPosts, null | number>) => {
                  applyPostLikePatchToPages(draft.pages, postId, likePatch)
                }
              )
            )
          )
        }

        // Keep the followers feed in sync with the shared like contract.
        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              'getFollowersFeed',
              FOLLOWERS_FEED_QUERY_ARGS,
              (draft: InfiniteData<FollowersFeedResponse, FollowersFeedPageParams>) => {
                applyPostLikePatchToPages(draft.pages, postId, likePatch)
              }
            )
          )
        )

        try {
          await queryFulfilled
        } catch {
          patches.forEach(p => p.undo())

          return
        }
      },
    }),
    getFollowersFeed: builder.infiniteQuery<
      FollowersFeedResponse,
      FollowersFeedParams,
      FollowersFeedPageParams
    >({
      infiniteQueryOptions: {
        initialPageParam: {
          endCursorPostId: 0,
          pageNumber: 1,
        },
        getNextPageParam: lastPage => {
          const { nextCursor, page, pagesCount } = lastPage

          if (nextCursor === null || nextCursor === 0 || page >= pagesCount) {
            return undefined
          }

          return {
            endCursorPostId: nextCursor,
            pageNumber: page + 1,
          }
        },
      },
      query: ({ queryArg, pageParam }) => ({
        url: API_ROUTES.HOME.PUBLICATIONS_FOLLOWERS,
        params: {
          pageSize: queryArg.pageSize ?? 12,
          pageNumber: pageParam.pageNumber,
          endCursorPostId: pageParam.endCursorPostId,
        },
      }),
      providesTags: ['FollowersFeed'],
    }),
  }),
})

export const {
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useCreateCommentMutation,
  useUploadImageMutation,
  useDeleteImageMutation,
  useGetPostByIdQuery,
  useGetPostsByUserQuery,
  useGetInfinitePostsByUserInfiniteQuery: useGetPostsByUserInfiniteQuery,
  useLazyGetPostsByUserQuery,
  useGetPostsQuery,
  useGetPostLikesQuery,
  useUpdateLikeStatusMutation,
  useGetFollowersFeedInfiniteQuery,
} = postApi
