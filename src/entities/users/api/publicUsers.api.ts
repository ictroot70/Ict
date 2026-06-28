import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

import {
  FollowUserRequest,
  GetPublicPostsRequest,
  GetPublicPostsResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  UserByUserNameResponse,
} from './api.types'

export const publicUsersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followUser: builder.mutation<void, FollowUserRequest>({
      query: body => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ selectedUserId }, { dispatch, queryFulfilled, api }) {
        const state = api.getState() as any
        const meUser = state.baseApi?.queries?.me?.data as any
        const currentUserId = meUser?.userId

        const targetProfileQuery = Object.entries(state.baseApi?.queries || {}).find(
          ([key]) => key.includes('getPublicProfile') && key.includes(selectedUserId)
        )
        const targetUserName = targetProfileQuery?.[1]?.data?.userName

        const patchTarget = (isFollowing: boolean, followersDelta: number) => {
          dispatch(
            baseApi.util.updateQueryData(
              'getPublicProfile',
              { profileId: selectedUserId },
              draft => {
                if (draft) {
                  draft.isFollowing = isFollowing
                  draft.userMetadata.followers += followersDelta
                }
              }
            )
          )
          if (targetUserName) {
            dispatch(
              baseApi.util.updateQueryData('getUserByUserName', targetUserName, draft => {
                if (draft) {
                  draft.isFollowing = isFollowing
                  draft.followersCount += followersDelta
                }
              })
            )
          }
        }

        const patchMe = (followingDelta: number) => {
          if (currentUserId) {
            dispatch(
              baseApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                draft => {
                  if (draft) {
                    draft.userMetadata.following += followingDelta
                  }
                }
              )
            )
          }
        }

        patchTarget(true, 1)
        patchMe(1)

        try {
          await queryFulfilled
        } catch {
          patchTarget(false, -1)
          patchMe(-1)
        }
      },
      invalidatesTags: ['Profile'],
    }),
    unfollowUser: builder.mutation<void, number>({
      query: userId => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(userId),
        method: 'DELETE',
      }),
      async onQueryStarted(selectedUserId, { dispatch, queryFulfilled, api }) {
        const state = api.getState() as any
        const meUser = state.baseApi?.queries?.me?.data as any
        const currentUserId = meUser?.userId

        const targetProfileQuery = Object.entries(state.baseApi?.queries || {}).find(
          ([key]) => key.includes('getPublicProfile') && key.includes(selectedUserId)
        )
        const targetUserName = targetProfileQuery?.[1]?.data?.userName

        const patchTarget = (isFollowing: boolean, followersDelta: number) => {
          dispatch(
            baseApi.util.updateQueryData(
              'getPublicProfile',
              { profileId: selectedUserId },
              draft => {
                if (draft) {
                  draft.isFollowing = isFollowing
                  draft.userMetadata.followers += followersDelta
                }
              }
            )
          )
          if (targetUserName) {
            dispatch(
              baseApi.util.updateQueryData('getUserByUserName', targetUserName, draft => {
                if (draft) {
                  draft.isFollowing = isFollowing
                  draft.followersCount += followersDelta
                }
              })
            )
          }
        }

        const patchMe = (followingDelta: number) => {
          if (currentUserId) {
            dispatch(
              baseApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                draft => {
                  if (draft) {
                    draft.userMetadata.following += followingDelta
                  }
                }
              )
            )
          }
        }

        patchTarget(false, -1)
        patchMe(-1)

        try {
          await queryFulfilled
        } catch {
          patchTarget(true, 1)
          patchMe(1)
        }
      },
      invalidatesTags: ['Profile'],
    }),
    // Authenticated lookup that returns the per-viewer follow status (isFollowing).
    getUserByUserName: builder.query<UserByUserNameResponse, string>({
      query: userName => ({
        url: API_ROUTES.USERS_FOLLOW.BY_USERNAME(userName),
      }),
      providesTags: ['Profile'],
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
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetUserByUserNameQuery,
} = publicUsersApi
