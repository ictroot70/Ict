import {
  CreatePostInputDto,
  GetPostsByUserParams,
  GetPostsParams,
  PaginatedResponse,
  PostViewModel,
  UpdateLikeStatusDto,
  UpdatePostInputDto,
  UploadedImageViewModel,
} from '@/entities/posts/api/posts.types'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'

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
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: `USER-${userId}` },
      ],
      async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData('getPostsByUser', { userId }, draft => {
            if (draft.pages.length > 0) {
              const firstPage = draft.pages[0]
              if (firstPage) {
                firstPage.totalCount += 1
              }
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
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
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: `USER-${userId}` },
      ],
      async onQueryStarted({ postId, body, userId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData('getPostsByUser', { userId }, draft => {
            const post = draft.pages.flatMap(p => p.items).find(p => p.id === postId)

            if (post && body.description) {
              post.description = body.description
              post.updatedAt = new Date().toISOString()
            }
          })
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
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: `USER-${userId}` },
      ],
      async onQueryStarted({ postId, userId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData('getPostsByUser', { userId }, draft => {
            draft.pages = draft.pages.map(items => {
              items.items = items.items.filter(p => p.id !== postId)
              return items
            })
            if (draft.pages.length > 0) {
              const firstPage = draft.pages[0]
              if (firstPage) {
                firstPage.totalCount = Math.max(0, firstPage.totalCount - 1)
              }
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    uploadImage: builder.mutation<UploadedImageViewModel, FormData>({
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

    getPostsByUser: builder.infiniteQuery<
      PaginatedResponse<PostViewModel>,
      GetPostsByUserParams,
      number | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: lastPage => {
          const lastPostId = lastPage.items[lastPage.items.length - 1]?.id
          return lastPostId || null
        },
      },
      query: ({ pageParam, queryArg }) => {
        const cursorId = pageParam === null ? 0 : pageParam
        return {
          url: API_ROUTES.POSTS.USER_POSTS(queryArg.userId, cursorId),
          params: { pageSize: 8, sortDirection: 'desc', endCursorPostId: pageParam },
        }
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.pages.flatMap(page =>
                page.items.map(({ id }) => ({ type: 'Post' as const, id }))
              ),
              { type: 'Post', id: 'LIST' },
              { type: 'Post', id: `USER-${arg.userId}` },
            ]
          : [
              { type: 'Post', id: 'LIST' },
              { type: 'Post', id: `USER-${arg.userId}` },
            ],
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.userId}`,
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

    //! Old version
    /* 
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
    }), */

    // ! Don't use
    /*   getPosts: builder.query<PaginatedResponse<PostViewModel>, GetPostsParams>({
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
    }), */
  }),
})

export const {
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUploadImageMutation,
  useDeleteImageMutation,
  useGetPostByIdQuery,
  useUpdateLikeStatusMutation,
  useGetPostsByUserInfiniteQuery,
} = postApi
