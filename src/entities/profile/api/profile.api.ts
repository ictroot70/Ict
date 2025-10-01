import {
  ProfileUpdateDto,
  ProfileViewModel,
  ProfileWithPostsResponse,
  PublicProfileRequest,
  PublicProfileResponse,
} from '@/entities/profile/api/api.types'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseApi } from '@/shared/api/base-api'

export const profileApi = baseApi.injectEndpoints({
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
    getPublicProfile: builder.query<PublicProfileResponse, PublicProfileRequest>({
      query: ({ profileId }) => ({
        url: API_ROUTES.PUBLIC_USER.PROFILE(profileId),
      }),
    }),
    getPostsByUserName: builder.query<ProfileWithPostsResponse, string>({
      query: userName => ({ url: `v1/users/${userName}` }),
    }),
  }),
})

export const {
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
  useGetPublicProfileQuery,
  useGetPostsByUserNameQuery,
} = profileApi
