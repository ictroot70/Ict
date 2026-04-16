import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

import { GetPublicPostsRequest, GetPublicPostsResponse } from './api.types'

export const publicUsersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPublicUsersCounter: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: API_ROUTES.PUBLIC_USER.COUNT,
      }),
    }),
    getPublicPosts: builder.query<GetPublicPostsResponse, GetPublicPostsRequest>({
      query: ({ endCursorPostId = 0, ...params }) => ({
        params,
        url: API_ROUTES.POSTS.ALL(endCursorPostId),
      }),
    }),
  }),
})

export const { useGetPublicUsersCounterQuery, useGetPublicPostsQuery } = publicUsersApi
