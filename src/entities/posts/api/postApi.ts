import {
  CreatePostInputDto,
  GetCommentAnswersParams,
  GetCommentsParams,
  GetPostsByUserParams,
  GetPostsParams,
  PaginatedAnswersResponse,
  PaginatedCommentsResponse,
  PaginatedPosts,
  PaginatedResponse,
  PostImageViewModel,
  PostViewModel,
  UpdateLikeStatusDto,
  UpdatePostInputDto,
} from '@/entities/posts/api/posts.types'
import {
  COMMENTS_PAGE_SIZE,
  getAnswersNextPageParam,
  getCommentsNextPageParam,
  incrementCommentAnswerCount,
  patchAnswerLikeInPages,
  patchCommentLikeInPages,
  patchPostLikeFields,
  prependAnswerToPages,
  prependCommentToPages,
} from '@/entities/posts/lib/comment-likes'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { AnswersViewModel, CommentsViewModel, CreateCommentDto } from '@/shared/types/comments'
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

    updateLikeStatus: builder.mutation<
      PostViewModel,
      { postId: number; data: UpdateLikeStatusDto; userId?: number }
    >({
      query: ({ postId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_POST(postId),
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ postId, data, userId }, { dispatch, queryFulfilled }) {
        const postByIdPatchResult = dispatch(
          postApi.util.updateQueryData('getPostById', postId, draft => {
            patchPostLikeFields(draft, data.likeStatus)
          })
        )

        const userPostsPatchResult =
          isValidUserId(userId ?? 0) &&
          dispatch(
            postApi.util.updateQueryData(
              'getInfinitePostsByUser',
              { userId: userId as number },
              (draft: InfiniteData<PaginatedPosts, null | number>) => {
                for (const page of draft.pages) {
                  const post = page.items.find(item => item.id === postId)

                  if (post) {
                    patchPostLikeFields(post, data.likeStatus)
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

          if (userPostsPatchResult) {
            userPostsPatchResult.undo()
          }
        }
      },
    }),

    getPostComments: builder.infiniteQuery<PaginatedCommentsResponse, GetCommentsParams, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: getCommentsNextPageParam,
      },
      query: ({ pageParam, queryArg }) => ({
        url: API_ROUTES.POSTS.COMMENTS(queryArg.postId),
        params: {
          pageSize: queryArg.pageSize ?? COMMENTS_PAGE_SIZE,
          pageNumber: pageParam,
          sortDirection: queryArg.sortDirection ?? 'desc',
          sortBy: queryArg.sortBy,
        },
      }),
      providesTags: (result, error, { postId }) => [{ type: 'Comments', id: postId }],
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.postId}`,
    }),

    getCommentAnswers: builder.infiniteQuery<
      PaginatedAnswersResponse,
      GetCommentAnswersParams,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: getAnswersNextPageParam,
      },
      query: ({ pageParam, queryArg }) => ({
        url: API_ROUTES.POSTS.COMMENT_ANSWERS(queryArg.postId, queryArg.commentId),
        params: {
          pageSize: queryArg.pageSize ?? COMMENTS_PAGE_SIZE,
          pageNumber: pageParam,
          sortDirection: queryArg.sortDirection ?? 'desc',
          sortBy: queryArg.sortBy,
        },
      }),
      providesTags: (result, error, { postId, commentId }) => [
        { type: 'Comments', id: `${postId}-${commentId}` },
      ],
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.postId}-${queryArgs.commentId}`,
    }),

    updateCommentLikeStatus: builder.mutation<
      void,
      { postId: number; commentId: number; data: UpdateLikeStatusDto }
    >({
      query: ({ postId, commentId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_COMMENT(postId, commentId),
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ postId, commentId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData(
            'getPostComments',
            { postId, pageSize: COMMENTS_PAGE_SIZE },
            (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
              patchCommentLikeInPages(draft, commentId, data.likeStatus)
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

    updateAnswerLikeStatus: builder.mutation<
      void,
      { postId: number; commentId: number; answerId: number; data: UpdateLikeStatusDto }
    >({
      query: ({ postId, commentId, answerId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_ANSWER(postId, commentId, answerId),
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ postId, commentId, answerId, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData(
            'getCommentAnswers',
            { postId, commentId, pageSize: COMMENTS_PAGE_SIZE },
            (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
              patchAnswerLikeInPages(draft, answerId, data.likeStatus)
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
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          const { data: createdComment } = await queryFulfilled

          dispatch(
            postApi.util.updateQueryData(
              'getPostComments',
              { postId, pageSize: COMMENTS_PAGE_SIZE },
              (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
                prependCommentToPages(draft, createdComment)
              }
            )
          )
        } catch {
          // handled by caller
        }
      },
    }),

    createAnswer: builder.mutation<
      AnswersViewModel,
      { postId: number; commentId: number; body: CreateCommentDto }
    >({
      query: ({ postId, commentId, body }) => ({
        url: API_ROUTES.POSTS.CREATE_ANSWER_COMMENT(postId, commentId),
        method: 'POST',
        body,
      }),
      async onQueryStarted({ postId, commentId }, { dispatch, queryFulfilled }) {
        try {
          const { data: createdAnswer } = await queryFulfilled

          dispatch(
            postApi.util.updateQueryData(
              'getCommentAnswers',
              { postId, commentId, pageSize: COMMENTS_PAGE_SIZE },
              (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
                prependAnswerToPages(draft, createdAnswer)
              }
            )
          )

          dispatch(
            postApi.util.updateQueryData(
              'getPostComments',
              { postId, pageSize: COMMENTS_PAGE_SIZE },
              (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
                incrementCommentAnswerCount(draft, commentId)
              }
            )
          )
        } catch {
          // handled by caller
        }
      },
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
  useGetPostCommentsInfiniteQuery,
  useGetCommentAnswersInfiniteQuery,
  useUpdateCommentLikeStatusMutation,
  useUpdateAnswerLikeStatusMutation,
  useCreateCommentMutation,
  useCreateAnswerMutation,
} = postApi
