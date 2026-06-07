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
  createOptimisticId,
  getAnswersNextPageParam,
  getCommentsNextPageParam,
  incrementCommentAnswerCount,
  patchAnswerLikeInPages,
  patchCommentLikeInPages,
  patchPostLikeFields,
  prependAnswerToPages,
  prependCommentToPages,
  replaceAnswerInPages,
  replaceCommentInPages,
} from '@/entities/posts/lib/comment-likes'
import {
  getCreatePostInvalidationTags,
  getPostMutationInvalidationTags,
  getUserPostsNextPageParam,
  isValidUserId,
  mergeUserPostsCache,
  patchPostDescriptionInUserFeed,
  patchPostLikeInUserFeed,
  prependPostToUserFeed,
  removePostFromUserFeed,
} from '@/entities/posts/lib/post-cache-patches'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { showToastAlert } from '@/shared/lib'
import { AnswersViewModel, CommentsViewModel, CreateCommentDto } from '@/shared/types/comments'
import { UserBase } from '@/shared/types/user/models'
import { InfiniteData } from '@reduxjs/toolkit/query'

export const postApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ===== POSTS =====
    createPost: builder.mutation<PostViewModel, { body: CreatePostInputDto; userId: number }>({
      query: ({ body }) => ({
        url: API_ROUTES.POSTS.BASE,
        method: 'POST',
        body: { ...body, description: body.description || undefined },
      }),
      invalidatesTags: (result, error, { userId }) =>
        getCreatePostInvalidationTags(result?.ownerId ?? userId),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: createdPost } = await queryFulfilled

          dispatch(
            postApi.util.updateQueryData(
              'getInfinitePostsByUser',
              { userId: createdPost.ownerId },
              draft => prependPostToUserFeed(draft, createdPost)
            )
          )
        } catch {
          // handled by invalidation
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
      invalidatesTags: (result, error, { postId, userId }) =>
        getPostMutationInvalidationTags(postId, userId),
      async onQueryStarted({ postId, body, userId }, { dispatch, queryFulfilled }) {
        if (!isValidUserId(userId) || !body.description) {
          try {
            await queryFulfilled
          } catch {
            // handled by invalidation
          }

          return
        }

        const postByIdPatchResult = dispatch(
          postApi.util.updateQueryData('getPostById', postId, draft => {
            draft.description = body.description!
            draft.updatedAt = new Date().toISOString()
          })
        )

        const patchResult = dispatch(
          postApi.util.updateQueryData('getInfinitePostsByUser', { userId }, draft =>
            patchPostDescriptionInUserFeed(draft, postId, body.description!)
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
      invalidatesTags: (result, error, { postId, userId }) =>
        getPostMutationInvalidationTags(postId, userId),
      async onQueryStarted({ postId, userId }, { dispatch, queryFulfilled }) {
        if (!isValidUserId(userId)) {
          try {
            await queryFulfilled
          } catch {
            // handled by invalidation
          }

          return
        }

        const patchResult = dispatch(
          postApi.util.updateQueryData('getInfinitePostsByUser', { userId }, draft =>
            removePostFromUserFeed(draft, postId)
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
      merge: mergeUserPostsCache,
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
        getNextPageParam: ({ items }) => getUserPostsNextPageParam(items),
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
      {
        postId: number
        data: UpdateLikeStatusDto
        userId?: number
        currentUserAvatar?: string
      }
    >({
      query: ({ postId, data }) => ({
        url: API_ROUTES.POSTS.LIKE_STATUS_POST(postId),
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(
        { postId, data, userId, currentUserAvatar },
        { dispatch, queryFulfilled }
      ) {
        const postByIdPatchResult = dispatch(
          postApi.util.updateQueryData('getPostById', postId, draft => {
            patchPostLikeFields(draft, data.likeStatus, currentUserAvatar)
          })
        )

        const userPostsPatchResult =
          isValidUserId(userId ?? 0) &&
          dispatch(
            postApi.util.updateQueryData(
              'getInfinitePostsByUser',
              { userId: userId as number },
              draft => patchPostLikeInUserFeed(draft, postId, data.likeStatus, currentUserAvatar)
            )
          )

        try {
          await queryFulfilled
        } catch {
          postByIdPatchResult.undo()
          if (userPostsPatchResult) {
            userPostsPatchResult.undo()
          }
          showToastAlert({ message: 'Failed to update like', type: 'error' })
        }
      },
    }),

    // ===== COMMENTS =====
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
            { postId },
            (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
              patchCommentLikeInPages(draft, commentId, data.likeStatus)
            }
          )
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
          showToastAlert({ message: 'Failed to update like', type: 'error' })
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
            { postId, commentId },
            (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
              patchAnswerLikeInPages(draft, answerId, data.likeStatus)
            }
          )
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
          showToastAlert({ message: 'Failed to update like', type: 'error' })
        }
      },
    }),

    createComment: builder.mutation<
      CommentsViewModel,
      { postId: number; body: CreateCommentDto; optimisticFrom?: UserBase }
    >({
      query: ({ postId, body }) => ({
        url: API_ROUTES.POSTS.CREATE_COMMENT(postId),
        method: 'POST',
        body,
      }),
      async onQueryStarted({ postId, body, optimisticFrom }, { dispatch, queryFulfilled }) {
        const tempId = createOptimisticId()
        const optimisticComment: CommentsViewModel = {
          id: tempId,
          postId,
          content: body.content,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
          answerCount: 0,
          from: optimisticFrom ?? { id: 0, userName: 'You', avatars: [] },
        }

        const patchResult = dispatch(
          postApi.util.updateQueryData(
            'getPostComments',
            { postId, pageSize: COMMENTS_PAGE_SIZE },
            (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
              prependCommentToPages(draft, optimisticComment)
            }
          )
        )

        try {
          const { data: createdComment } = await queryFulfilled

          dispatch(
            postApi.util.updateQueryData(
              'getPostComments',
              { postId, pageSize: COMMENTS_PAGE_SIZE },
              (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
                replaceCommentInPages(draft, tempId, createdComment)
              }
            )
          )
        } catch {
          patchResult.undo()
          showToastAlert({ message: 'Failed to publish comment', type: 'error' })
        }
      },
    }),

    createAnswer: builder.mutation<
      AnswersViewModel,
      { postId: number; commentId: number; body: CreateCommentDto; optimisticFrom?: UserBase }
    >({
      query: ({ postId, commentId, body }) => ({
        url: API_ROUTES.POSTS.CREATE_ANSWER_COMMENT(postId, commentId),
        method: 'POST',
        body,
      }),
      async onQueryStarted(
        { postId, commentId, body, optimisticFrom },
        { dispatch, queryFulfilled, getState }
      ) {
        const answersArgs = { postId, commentId, pageSize: COMMENTS_PAGE_SIZE }
        const tempId = createOptimisticId()
        const optimisticAnswer: AnswersViewModel = {
          id: tempId,
          commentId,
          content: body.content,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
          from: optimisticFrom ?? { id: 0, userName: 'You', avatars: [] },
        }

        const cacheEntry = postApi.endpoints.getCommentAnswers.select(answersArgs)(getState())
        const hasCache = Boolean(cacheEntry.data?.pages?.length)

        let undoAnswer: (() => void) | undefined

        if (hasCache) {
          const patchResult = dispatch(
            postApi.util.updateQueryData(
              'getCommentAnswers',
              answersArgs,
              (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
                prependAnswerToPages(draft, optimisticAnswer)
              }
            )
          )

          undoAnswer = () => patchResult.undo()
        } else {
          dispatch(
            postApi.util.upsertQueryData('getCommentAnswers', answersArgs, {
              pages: [
                {
                  items: [optimisticAnswer],
                  pageSize: COMMENTS_PAGE_SIZE,
                  totalCount: 1,
                },
              ],
              pageParams: [1],
            } as unknown as InfiniteData<PaginatedAnswersResponse, number>)
          )
          undoAnswer = () => {
            dispatch(
              postApi.util.invalidateTags([{ type: 'Comments', id: `${postId}-${commentId}` }])
            )
          }
        }

        const countPatchResult = dispatch(
          postApi.util.updateQueryData(
            'getPostComments',
            { postId, pageSize: COMMENTS_PAGE_SIZE },
            (draft: InfiniteData<PaginatedCommentsResponse, number>) => {
              incrementCommentAnswerCount(draft, commentId)
            }
          )
        )

        try {
          const { data: createdAnswer } = await queryFulfilled

          if (hasCache) {
            dispatch(
              postApi.util.updateQueryData(
                'getCommentAnswers',
                answersArgs,
                (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
                  replaceAnswerInPages(draft, tempId, createdAnswer)
                }
              )
            )
          } else {
            dispatch(
              postApi.util.upsertQueryData('getCommentAnswers', answersArgs, {
                pages: [
                  {
                    items: [createdAnswer],
                    pageSize: COMMENTS_PAGE_SIZE,
                    totalCount: 1,
                  },
                ],
                pageParams: [1],
              } as unknown as InfiniteData<PaginatedAnswersResponse, number>)
            )
          }
        } catch {
          undoAnswer?.()
          countPatchResult.undo()
          showToastAlert({ message: 'Failed to publish answer', type: 'error' })
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
