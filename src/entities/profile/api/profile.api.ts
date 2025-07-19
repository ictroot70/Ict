import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { ProfileUpdateDto, ProfileViewModel } from '@/entities/profile/api/api.types'
import { API_ROUTES } from '@/shared/api/api-routes'

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getMyProfile: builder.query<ProfileViewModel, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.GET,
      }),
    }),
    putMyProfile: builder.mutation<ProfileViewModel, ProfileUpdateDto>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPDATE,
        method: 'PUT',
        body,
      }),
    }),
  }),
})

export const { useGetMyProfileQuery, useLazyGetMyProfileQuery } = profileApi
