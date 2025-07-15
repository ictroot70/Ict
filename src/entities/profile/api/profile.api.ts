import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { ProfileUpdateDto, ProfileViewModel } from '@/entities/profile/api/api.types'

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getMyProfile: builder.query<ProfileViewModel, void>({
      query: () => ({
        url: '/v1/users/profile',
      }),
    }),
    putMyProfile: builder.mutation<ProfileViewModel, ProfileUpdateDto>({
      query: body => ({
        url: '/v1/users/profile',
        method: 'PUT',
        body,
      }),
    }),
  }),
})

export const { useGetMyProfileQuery, useLazyGetMyProfileQuery } = profileApi
