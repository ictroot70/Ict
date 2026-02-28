import {
  ProfileDto,
  ProfileUpdateDto,
  PublicProfileResponse,
  UploadAvatarResponse,
} from '@/entities/profile/api/dto'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseApi } from '@/shared/api/base-api'
import { ExtractRtkActions } from '@/shared/lib/rtk/extract-actions'
import { ProfileWithPostsResponse, PublicProfileRequest } from '@/shared/types'

export const profileApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMyProfile: builder.query<ProfileDto, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.GET,
      }),
      providesTags: () => ['profile'],
    }),

    updateMyProfile: builder.mutation<ProfileDto, ProfileUpdateDto>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPDATE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['profile'],
    }),

    deleteMyProfile: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.DELETE,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['profile'],
    }),

    uploadAvatar: builder.mutation<UploadAvatarResponse, FormData>({
      query: body => ({
        url: API_ROUTES.PROFILE.UPLOAD_AVATAR,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => ['profile'],
    }),

    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.PROFILE.DELETE_AVATAR,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['profile'],
    }),

    /// Todo: move to public user entity
    getPublicProfile: builder.query<PublicProfileResponse, PublicProfileRequest>({
      query: ({ profileId }) => ({
        url: API_ROUTES.PUBLIC_USER.PROFILE(+profileId),
      }),
    }),
    // Todo: should be used
    getProfileByUserName: builder.query<ProfileWithPostsResponse, { userName: string }>({
      query: ({ userName }) => ({ url: `v1/users/${userName}` }),
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
  useGetProfileByUserNameQuery,
  useGetPublicProfileQuery,
} = profileApi

export type ProfileActions = ExtractRtkActions<typeof profileApi>
