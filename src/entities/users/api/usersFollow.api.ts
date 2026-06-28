import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'
import { UserSubscriptionInputDto } from '@/shared/types'

type FollowUserArgs = UserSubscriptionInputDto & {
  currentUserId: number
}

type UnfollowUserArgs = {
  currentUserId: number
  selectedUserId: number
}

const getAffectedProfileTags = (currentUserId: number, selectedUserId: number) => [
  { type: 'Profile' as const, id: currentUserId },
  { type: 'Profile' as const, id: selectedUserId },
]

export const usersFollowApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followUser: builder.mutation<void, FollowUserArgs>({
      query: ({ currentUserId, ...body }) => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { currentUserId, selectedUserId }) =>
        getAffectedProfileTags(currentUserId, selectedUserId),
    }),
    unfollowUser: builder.mutation<void, UnfollowUserArgs>({
      query: ({ selectedUserId }) => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(selectedUserId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { currentUserId, selectedUserId }) =>
        getAffectedProfileTags(currentUserId, selectedUserId),
    }),
  }),
})

export const { useFollowUserMutation, useUnfollowUserMutation } = usersFollowApi
