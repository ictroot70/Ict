import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'
import { UserSubscriptionInputDto } from '@/shared/types'

import { getFollowersListTag, getFollowingListTag } from './publicUsers.api'

type FollowUserArgs = UserSubscriptionInputDto & {
  currentUserId?: number
  currentUserName?: string
  targetUserName?: string
}

type UnfollowUserArgs = {
  currentUserId?: number
  currentUserName?: string
  selectedUserId: number
  targetUserName?: string
}

type DeleteFollowerArgs = {
  currentUserId?: number
  currentUserName?: string
  followerUserId: number
  followerUserName?: string
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

const getFollowListTags = (currentUserName?: string, targetUserName?: string) => [
  ...(currentUserName
    ? [{ type: 'FollowList' as const, id: getFollowingListTag(currentUserName) }]
    : []),
  ...(targetUserName
    ? [{ type: 'FollowList' as const, id: getFollowersListTag(targetUserName) }]
    : []),
]

export const usersFollowApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followUser: builder.mutation<void, FollowUserArgs>({
      query: ({ currentUserId, currentUserName, targetUserName, ...body }) => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      invalidatesTags: (
        result,
        error,
        { currentUserId, currentUserName, selectedUserId, targetUserName }
      ) => [
        ...getAffectedProfileTags(currentUserId, selectedUserId, targetUserName),
        ...getFollowListTags(currentUserName, targetUserName),
      ],
    }),
    unfollowUser: builder.mutation<void, UnfollowUserArgs>({
      query: ({ currentUserId, currentUserName, targetUserName, selectedUserId }) => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body: { selectedUserId },
      }),
      invalidatesTags: (
        result,
        error,
        { currentUserId, currentUserName, selectedUserId, targetUserName }
      ) => [
        ...getAffectedProfileTags(currentUserId, selectedUserId, targetUserName),
        ...getFollowListTags(currentUserName, targetUserName),
      ],
    }),
    deleteFollower: builder.mutation<void, DeleteFollowerArgs>({
      query: ({ currentUserId, currentUserName, followerUserId, followerUserName }) => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(followerUserId),
        method: 'DELETE',
      }),
      invalidatesTags: (
        result,
        error,
        { currentUserId, currentUserName, followerUserId, followerUserName }
      ) => [
        ...(currentUserId ? [{ type: 'Profile' as const, id: currentUserId }] : []),
        { type: 'Profile' as const, id: followerUserId },
        ...(followerUserName
          ? [
              { type: 'Profile' as const, id: `USERNAME-${followerUserName}` },
              { type: 'FollowList' as const, id: getFollowingListTag(followerUserName) },
            ]
          : []),
        ...(currentUserName
          ? [{ type: 'FollowList' as const, id: getFollowersListTag(currentUserName) }]
          : []),
      ],
    }),
  }),
})

export const { useDeleteFollowerMutation, useFollowUserMutation, useUnfollowUserMutation } =
  usersFollowApi
