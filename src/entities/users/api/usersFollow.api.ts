import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'
import { UserSubscriptionInputDto } from '@/shared/types'

export const usersFollowApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    followUser: builder.mutation<void, UserSubscriptionInputDto>({
      query: body => ({
        url: API_ROUTES.USERS_FOLLOW.FOLLOWING,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    unfollowUser: builder.mutation<void, number>({
      query: userId => ({
        url: API_ROUTES.USERS_FOLLOW.DELETE_FOLLOWER(userId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const { useFollowUserMutation, useUnfollowUserMutation } = usersFollowApi
