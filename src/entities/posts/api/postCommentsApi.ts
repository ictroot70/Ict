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

export const commentsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
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

export const {
  useGetPostCommentsInfiniteQuery,
  useGetCommentAnswersInfiniteQuery,
  useUpdateCommentLikeStatusMutation,
  useUpdateAnswerLikeStatusMutation,
} = commentsApi
