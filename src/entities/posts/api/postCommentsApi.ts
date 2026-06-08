import {
  GetCommentAnswersParams,
  GetCommentsParams,
  PaginatedAnswersResponse,
  PaginatedCommentsResponse,
  UpdateLikeStatusDto,
} from '@/entities/posts/api/posts.types'
import {
  COMMENTS_PAGE_SIZE,
  createOptimisticId,
  getAnswersNextPageParam,
  getCommentsNextPageParam,
  incrementCommentAnswerCount,
  patchAnswerLikeInPages,
  patchCommentLikeInPages,
  prependAnswerToPages,
  prependCommentToPages,
  replaceAnswerInPages,
  replaceCommentInPages,
} from '@/entities/posts/lib/comment-likes'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { showToastAlert } from '@/shared/lib'
import { AnswersViewModel, CommentsViewModel, CreateCommentDto } from '@/shared/types/comments'
import { UserBase } from '@/shared/types/user/models'
import { InfiniteData } from '@reduxjs/toolkit/query'

const commentsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
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
          commentsApi.util.updateQueryData(
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
          commentsApi.util.updateQueryData(
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
          commentsApi.util.updateQueryData(
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
            commentsApi.util.updateQueryData(
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

        const cacheEntry = commentsApi.endpoints.getCommentAnswers.select(answersArgs)(getState())
        const hasCache = Boolean(cacheEntry.data?.pages?.length)

        let undoAnswer: (() => void) | undefined

        if (hasCache) {
          const patchResult = dispatch(
            commentsApi.util.updateQueryData(
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
            commentsApi.util.upsertQueryData('getCommentAnswers', answersArgs, {
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
              commentsApi.util.invalidateTags([{ type: 'Comments', id: `${postId}-${commentId}` }])
            )
          }
        }

        const countPatchResult = dispatch(
          commentsApi.util.updateQueryData(
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
              commentsApi.util.updateQueryData(
                'getCommentAnswers',
                answersArgs,
                (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
                  replaceAnswerInPages(draft, tempId, createdAnswer)
                }
              )
            )
          } else {
            dispatch(
              commentsApi.util.upsertQueryData('getCommentAnswers', answersArgs, {
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
  useGetPostCommentsInfiniteQuery,
  useGetCommentAnswersInfiniteQuery,
  useUpdateCommentLikeStatusMutation,
  useUpdateAnswerLikeStatusMutation,
  useCreateCommentMutation,
  useCreateAnswerMutation,
} = commentsApi
