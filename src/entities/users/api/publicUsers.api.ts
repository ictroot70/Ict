import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

import {
  GetPublicPostsRequest,
  GetPublicPostsResponse,
  FollowListRequest,
  FollowListResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  UserByUserNameResponse,
} from './api.types'

export const getFollowersListTag = (userName: string) => `FOLLOWERS-${userName}`
export const getFollowingListTag = (userName: string) => `FOLLOWING-${userName}`

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
    getFollowersByUserName: builder.query<FollowListResponse, FollowListRequest>({
      query: ({ userName, ...params }) => ({
        params,
        url: API_ROUTES.USERS_FOLLOW.FOLLOWERS_BY_USERNAME(userName),
      }),
      providesTags: (result, error, { userName }) => [
        { type: 'FollowList', id: getFollowersListTag(userName) },
      ],
    }),
    getFollowingByUserName: builder.query<FollowListResponse, FollowListRequest>({
      query: ({ userName, ...params }) => ({
        params,
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING_BY_USERNAME(userName),
      }),
      providesTags: (result, error, { userName }) => [
        { type: 'FollowList', id: getFollowingListTag(userName) },
      ],
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
  useLazyGetFollowersByUserNameQuery,
  useLazyGetFollowingByUserNameQuery,
  useSearchUsersQuery,
  useGetUserByUserNameQuery,
} = publicUsersApi
