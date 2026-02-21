import {
  ProfileData,
  PublicProfileData,
  ProfileUpdateRequest,
  PublicProfileRequest,
} from '@/entities/profile/api/profile.types'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

export const profileApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMyProfile: builder.query<ProfileData, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.GET,
      }),
    }),
    putMyProfile: builder.mutation<ProfileData, ProfileUpdateRequest>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPDATE,
        method: 'PUT',
        body,
      }),
    }),
    getPublicProfile: builder.query<PublicProfileData, PublicProfileRequest>({
      query: ({ profileId }) => {
        return {
          url: API_ROUTES.PUBLIC_USER.PROFILE(profileId),
        }
      },
      providesTags: ['Profile'],
    }),
  }),
})

export const { useGetMyProfileQuery, useLazyGetMyProfileQuery, useGetPublicProfileQuery } =
  profileApi
