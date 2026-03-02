/* eslint-disable max-lines */
import {
  CreatePostInputDto,
  GetPostsByUserParams,
  GetPostsParams,
  PaginatedPosts,
  PaginatedResponse,
  PostImageViewModel,
  PostViewModel,
  UpdateLikeStatusDto,
  UpdatePostInputDto,
} from '@/entities/posts/api/posts.types'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { InfiniteData } from '@reduxjs/toolkit/query'

const isValidUserId = (userId: number) => Number.isInteger(userId) && userId > 0

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

    updateLikeStatus: builder.mutation<
      PostViewModel,
      { postId: number; data: UpdateLikeStatusDto }
    >({
      query: ({ postId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_POST(postId),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
  }),
})

export const {
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUploadImageMutation,
  useDeleteImageMutation,
  useGetPostByIdQuery,
  useGetPostsByUserQuery,
  useGetInfinitePostsByUserInfiniteQuery: useGetPostsByUserInfiniteQuery,
  useLazyGetPostsByUserQuery,
  useGetPostsQuery,
  useUpdateLikeStatusMutation,
} = postApi
