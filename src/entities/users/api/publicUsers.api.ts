import type { PublicProfileData } from '@/entities/profile/api'

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

type BaseQueryState = {
  baseApi?: {
    queries?: Record<string, { data?: unknown }>
  }
}

const updateBaseQueryData = baseApi.util.updateQueryData as any

export const publicUsersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followProfileUser: builder.mutation<void, FollowUserRequest>({
      query: body => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ selectedUserId }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as BaseQueryState
        const meUser = state.baseApi?.queries?.me?.data as { userId?: number } | undefined
        const currentUserId = meUser?.userId

        const targetProfileQuery = Object.entries(state.baseApi?.queries || {}).find(
          ([key]) => key.includes('getPublicProfile') && key.includes(String(selectedUserId))
        )
        const targetProfileData = targetProfileQuery?.[1]?.data as PublicProfileData | undefined
        const targetUserName = targetProfileData?.userName

        const patchTarget = (isFollowing: boolean, followersDelta: number) => {
          dispatch(
            updateBaseQueryData(
              'getPublicProfile',
              { profileId: selectedUserId },
              (draft: PublicProfileData | undefined) => {
                if (!draft) {
                  return
                }

                draft.isFollowing = isFollowing
                draft.userMetadata.followers += followersDelta
              }
            )
          )
          if (targetUserName) {
            dispatch(
              updateBaseQueryData(
                'getUserByUserName',
                targetUserName,
                (draft: UserByUserNameResponse | undefined) => {
                  if (!draft) {
                    return
                  }

                  draft.isFollowing = isFollowing
                  draft.followersCount += followersDelta
                }
              )
            )
          }
        }

        const patchMe = (followingDelta: number) => {
          if (currentUserId) {
            dispatch(
              updateBaseQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                (draft: PublicProfileData | undefined) => {
                  if (!draft) {
                    return
                  }

                  draft.userMetadata.following += followingDelta
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
    unfollowProfileUser: builder.mutation<void, number>({
      query: userId => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(userId),
        method: 'DELETE',
      }),
      async onQueryStarted(selectedUserId, { dispatch, queryFulfilled, getState }) {
        const state = getState() as BaseQueryState
        const meUser = state.baseApi?.queries?.me?.data as { userId?: number } | undefined
        const currentUserId = meUser?.userId

        const targetProfileQuery = Object.entries(state.baseApi?.queries || {}).find(
          ([key]) => key.includes('getPublicProfile') && key.includes(String(selectedUserId))
        )
        const targetProfileData = targetProfileQuery?.[1]?.data as PublicProfileData | undefined
        const targetUserName = targetProfileData?.userName

        const patchTarget = (isFollowing: boolean, followersDelta: number) => {
          dispatch(
            updateBaseQueryData(
              'getPublicProfile',
              { profileId: selectedUserId },
              (draft: PublicProfileData | undefined) => {
                if (!draft) {
                  return
                }

                draft.isFollowing = isFollowing
                draft.userMetadata.followers += followersDelta
              }
            )
          )
          if (targetUserName) {
            dispatch(
              updateBaseQueryData(
                'getUserByUserName',
                targetUserName,
                (draft: UserByUserNameResponse | undefined) => {
                  if (!draft) {
                    return
                  }

                  draft.isFollowing = isFollowing
                  draft.followersCount += followersDelta
                }
              )
            )
          }
        }

        const patchMe = (followingDelta: number) => {
          if (currentUserId) {
            dispatch(
              updateBaseQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                (draft: PublicProfileData | undefined) => {
                  if (!draft) {
                    return
                  }

                  draft.userMetadata.following += followingDelta
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
  useFollowProfileUserMutation,
  useUnfollowProfileUserMutation,
  useGetUserByUserNameQuery,
} = publicUsersApi
