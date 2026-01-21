import {
  CreatePostInputDto,
  GetPostsByUserParams,
  PaginatedPosts,
  PostViewModel,
  UpdateLikeStatusDto,
  UpdatePostInputDto,
  UploadedImageViewModel,
} from '@/entities/posts/api/posts.types'
import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'

export const postApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPostById: builder.query<PostViewModel, number>({
      query: postId => API_ROUTES.POSTS.BY_ID(postId),
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    getPostsByUser: builder.infiniteQuery<PaginatedPosts, GetPostsByUserParams, number | null>({
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
        const pageSize = cursorId === 0 ? 8 : 9

        return {
          url: API_ROUTES.POSTS.USER_POSTS(queryArg.userId, cursorId),
          params: { pageSize, sortDirection: 'desc' },
        }
      },
      providesTags: (result, error, arg) => ['Posts', { type: 'UserPosts', id: arg.userId }],
    }),

    createPost: builder.mutation<PostViewModel, { body: CreatePostInputDto }>({
      query: ({ body }) => {
        //TODO:Change.It is better to do such checking at the UI level or in another form before sending the request.
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
      invalidatesTags: ['Posts', 'Profile'],
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

    updatePost: builder.mutation<
      PostViewModel,
      { postId: number; body: UpdatePostInputDto; userId: number }
    >({
      query: ({ postId, body }) => ({
        url: API_ROUTES.POSTS.BY_POST_ID(postId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    deletePost: builder.mutation<void, { postId: number }>({
      query: ({ postId }) => ({
        url: API_ROUTES.POSTS.BY_POST_ID(postId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts', 'Profile'],
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
  useUpdateLikeStatusMutation,
  useGetPostsByUserInfiniteQuery,
} = postApi
