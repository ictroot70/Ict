import { profileApi } from '@/entities/profile/api/profileApi'
import { publicUsersApi } from '@/entities/users/api/publicUsers.api'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'
import { UserSubscriptionInputDto } from '@/shared/types'

import {
  CachePatchResult,
  isValidUserId,
  patchPublicProfileFollowers,
  patchPublicProfileFollowing,
  patchUserByUserNameFollowState,
} from './follow-cache'

type FollowUserArgs = UserSubscriptionInputDto & {
  currentUserId?: number
  targetUserName?: string
}

type UnfollowUserArgs = {
  currentUserId?: number
  selectedUserId: number
  targetUserName?: string
}

type DeleteFollowerArgs = {
  followerUserId: number
}

const getAffectedProfileTags = (
  currentUserId: number | undefined,
  selectedUserId: number,
  targetUserName?: string
) => [
  ...(currentUserId ? [{ type: 'Profile' as const, id: currentUserId }] : []),
  { type: 'Profile' as const, id: selectedUserId },
  ...(targetUserName ? [{ type: 'Profile' as const, id: `USERNAME-${targetUserName}` }] : []),
]

export const usersFollowApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followUser: builder.mutation<void, FollowUserArgs>({
      query: ({ currentUserId, targetUserName, ...body }) => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      async onQueryStarted(
        { currentUserId, selectedUserId, targetUserName },
        { dispatch, queryFulfilled }
      ) {
        const patch = {
          followersDelta: 1,
          followingDelta: 1,
          isFollowing: true,
        }
        const patches: CachePatchResult[] = []

        if (targetUserName) {
          patches.push(
            dispatch(
              publicUsersApi.util.updateQueryData('getUserByUserName', targetUserName, draft => {
                patchUserByUserNameFollowState(draft, patch)
              })
            )
          )
        }

        if (isValidUserId(selectedUserId)) {
          patches.push(
            dispatch(
              profileApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: selectedUserId },
                draft => {
                  patchPublicProfileFollowers(draft, patch)
                }
              )
            )
          )
        }

        if (isValidUserId(currentUserId)) {
          patches.push(
            dispatch(
              profileApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                draft => {
                  patchPublicProfileFollowing(draft, patch)
                }
              )
            )
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach(patch => patch.undo())
        }
      },
      invalidatesTags: (result, error, { currentUserId, selectedUserId, targetUserName }) =>
        error ? getAffectedProfileTags(currentUserId, selectedUserId, targetUserName) : [],
    }),
    unfollowUser: builder.mutation<void, UnfollowUserArgs>({
      query: ({ currentUserId, targetUserName, selectedUserId }) => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(selectedUserId),
        method: 'DELETE',
      }),
      async onQueryStarted(
        { currentUserId, selectedUserId, targetUserName },
        { dispatch, queryFulfilled }
      ) {
        const patch = {
          followersDelta: -1,
          followingDelta: -1,
          isFollowing: false,
        }
        const patches: CachePatchResult[] = []

        if (targetUserName) {
          patches.push(
            dispatch(
              publicUsersApi.util.updateQueryData('getUserByUserName', targetUserName, draft => {
                patchUserByUserNameFollowState(draft, patch)
              })
            )
          )
        }

        if (isValidUserId(selectedUserId)) {
          patches.push(
            dispatch(
              profileApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: selectedUserId },
                draft => {
                  patchPublicProfileFollowers(draft, patch)
                }
              )
            )
          )
        }

        if (isValidUserId(currentUserId)) {
          patches.push(
            dispatch(
              profileApi.util.updateQueryData(
                'getPublicProfile',
                { profileId: currentUserId },
                draft => {
                  patchPublicProfileFollowing(draft, patch)
                }
              )
            )
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach(patch => patch.undo())
        }
      },
      invalidatesTags: (result, error, { currentUserId, selectedUserId, targetUserName }) =>
        error ? getAffectedProfileTags(currentUserId, selectedUserId, targetUserName) : [],
    }),
    deleteFollower: builder.mutation<void, DeleteFollowerArgs>({
      query: ({ followerUserId }) => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(followerUserId),
        method: 'DELETE',
      }),
    }),
  }),
})

export const { useDeleteFollowerMutation, useFollowUserMutation, useUnfollowUserMutation } =
  usersFollowApi
