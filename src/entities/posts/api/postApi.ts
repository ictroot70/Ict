import {
  CreatePostInputDto,
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
import { patchPostLikeFields } from '@/entities/posts/lib/comment-likes'
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

export const postApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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

    getPostLikes: builder.query<PostLikesResponse, GetPostLikesParams>({
      query: ({ postId, pageSize = 3, pageNumber = 1, cursor = 0 }) => ({
        url: API_ROUTES.POSTS.POST_LIKES(postId),
        params: { pageSize, pageNumber, cursor },
      }),
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
  useGetPostLikesQuery,
  useUpdateLikeStatusMutation,
} = postApi
