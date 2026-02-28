import {
  ProfileDto,
  ProfileUpdateDto,
  PublicProfileRequest,
  PublicProfileResponse,
  UploadAvatarResponse,
} from '@/entities/profile/api/profile.types'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'

export const profileApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMyProfile: builder.query<ProfileDto, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.GET,
      }),
      providesTags: () => ['Profile'],
    }),
    updateMyProfile: builder.mutation<ProfileDto, ProfileUpdateDto>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPDATE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['Profile'],
    }),
    deleteMyProfile: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.DELETE,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['Profile'],
    }),
    uploadAvatar: builder.mutation<UploadAvatarResponse, FormData>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPLOAD_AVATAR,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => ['Profile'],
    }),
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.DELETE_AVATAR,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['Profile'],
    }),
    getPublicProfile: builder.query<PublicProfileResponse, PublicProfileRequest>({
      query: ({ profileId }) => {
        return {
          url: API_ROUTES.PUBLIC_USER.PROFILE(profileId),
        }
      },
      providesTags: ['Profile'],
    }),
  }),
})

export const {
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useDeleteMyProfileMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useGetPublicProfileQuery,
} = profileApi
