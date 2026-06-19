import {
  GetCommentAnswersParams,
  GetCommentsParams,
  PaginatedAnswersResponse,
  PaginatedCommentsResponse,
  UpdateLikeStatusDto,
} from '@/entities/posts/api/posts.types'
import {
  COMMENTS_PAGE_SIZE,
  getAnswersNextPageParam,
  getCommentsNextPageParam,
  patchAnswerLikeInPages,
  patchCommentLikeInPages,
} from '@/entities/posts/lib/comment-likes'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { AnswersViewModel } from '@/shared/types/comments'
import { InfiniteData } from '@reduxjs/toolkit/query'

type CreateCommentAnswerInput = {
  postId: number
  commentId: number
  content: string
  authorName?: string
  authorAvatar?: string
}

export const commentsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    createCommentAnswer: builder.mutation<void, CreateCommentAnswerInput>({
      query: ({ postId, commentId, content }) => ({
        url: API_ROUTES.POSTS.COMMENT_ANSWERS(postId, commentId),
        method: 'POST',
        body: { content },
      }),

      async onQueryStarted(
        { postId, commentId, content, authorName = 'You', authorAvatar },
        { dispatch, queryFulfilled }
      ) {
        const optimisticAnswer: Partial<AnswersViewModel> = {
          id: Date.now(),
          content,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
          from: {
            firstName: authorName,
            lastName: '',
            avatar: authorAvatar || '',
          } as any,
        }

        const patchResult = dispatch(
          commentsApi.util.updateQueryData(
            'getCommentAnswers',
            { postId, commentId },
            (draft: InfiniteData<PaginatedAnswersResponse, number>) => {
              // В InfiniteData данные находятся в массиве pages
              if (draft.pages.length > 0) {
                const firstPage = draft.pages[0]

                firstPage.items.unshift(optimisticAnswer as AnswersViewModel)
                // Увеличиваем счетчик на всех страницах для консистентности
                draft.pages.forEach(page => {
                  page.totalCount += 1
                })
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

      invalidatesTags: (result, error, { postId, commentId }) => [
        { type: 'Comments', id: `${postId}-${commentId}` },
      ],
    }),

    getPostComments: builder.infiniteQuery<PaginatedCommentsResponse, GetCommentsParams, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: getCommentsNextPageParam },
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
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: getAnswersNextPageParam },
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
          commentsApi.util.updateQueryData('getPostComments', { postId }, draft =>
            patchCommentLikeInPages(draft, commentId, data.likeStatus)
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
          commentsApi.util.updateQueryData('getCommentAnswers', { postId, commentId }, draft =>
            patchAnswerLikeInPages(draft, answerId, data.likeStatus)
          )
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

// Явный экспорт всех хуков
export const {
  useCreateCommentAnswerMutation,
  useGetPostCommentsInfiniteQuery,
  useGetCommentAnswersInfiniteQuery,
  useUpdateCommentLikeStatusMutation,
  useUpdateAnswerLikeStatusMutation,
} = commentsApi
