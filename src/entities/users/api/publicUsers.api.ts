import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

import {
  GetPublicPostsRequest,
  GetPublicPostsResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  UserByUserNameResponse,
} from './api.types'

export const publicUsersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Authenticated lookup that returns the per-viewer follow status (isFollowing).
    getUserByUserName: builder.query<UserByUserNameResponse, string>({
      query: userName => ({
        url: API_ROUTES.USERS_FOLLOW.BY_USERNAME(userName),
      }),
      providesTags: (result, error, userName) => [{ type: 'Profile', id: `USERNAME-${userName}` }],
    }),
    getPublicUsersCounter: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: API_ROUTES.PUBLIC_USER.COUNT,
      }),
    }),
    searchUsers: builder.query<SearchUsersResponse, SearchUsersRequest>({
      query: params => ({
        params,
        url: API_ROUTES.USERS_FOLLOW.SEARCH,
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

export const {
  useGetPublicUsersCounterQuery,
  useGetPublicPostsQuery,
  useSearchUsersQuery,
  useGetUserByUserNameQuery,
} = publicUsersApi
