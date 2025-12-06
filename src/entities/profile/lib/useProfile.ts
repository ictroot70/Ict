import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useDeleteMyProfileMutation,
} from '../api/profile.api'
import { ProfileUpdate } from '../model/domain/types'

export const useProfile = () => {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetMyProfileQuery()

  const [updateProfileMutation, updateProfileState] = useUpdateMyProfileMutation()
  const [deleteProfileMutation, deleteProfileState] = useDeleteMyProfileMutation()
  const [uploadAvatarMutation, uploadAvatarState] = useUploadAvatarMutation()
  const [deleteAvatarMutation, deleteAvatarState] = useDeleteAvatarMutation()

  const updateProfile = async (data: ProfileUpdate) => {
    await updateProfileMutation(data).unwrap()
  }

  const deleteProfile = async () => {
    await deleteProfileMutation().unwrap()
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    await uploadAvatarMutation(formData).unwrap()
  }

  const removeAvatar = async () => {
    await deleteAvatarMutation().unwrap()
  }

  return {
    profile,
    isProfileLoading,
    isProfileFetching,
    profileError,

    updateProfile,
    deleteProfile,
    uploadAvatar,
    removeAvatar,
    refetchProfile,

    updateProfileState,
    deleteProfileState,
    uploadAvatarState,
    deleteAvatarState,
  }
}
