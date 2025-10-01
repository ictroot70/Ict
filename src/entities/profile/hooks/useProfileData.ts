import { ProfileType, AvatarViewDto } from '../api'
import { isFullProfile, isPublicProfile } from '../model/type-guards'

interface ProfileData {
  userName: string
  fullName?: string
  aboutMe: string
  avatars: AvatarViewDto[]
  following: number
  followers: number
  publications: number
}

export const useProfileData = (profile: ProfileType): ProfileData => {
  const transformProfile = (): ProfileData => {
    if (isFullProfile(profile)) {
      return {
        userName: profile.userName,
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        aboutMe: profile.aboutMe || '',
        avatars: profile.avatars || [],
        following: profile.followingCount,
        followers: profile.followersCount,
        publications: profile.publicationsCount,
      }
    }

    if (isPublicProfile(profile)) {
      return {
        userName: profile.userName,
        aboutMe: profile.aboutMe || '',
        avatars: profile.avatars || [],
        following: profile.userMetadata.following,
        followers: profile.userMetadata.followers,
        publications: profile.userMetadata.publications,
      }
    }

    return {
      userName: '',
      fullName: '',
      aboutMe: '',
      avatars: [],
      following: 0,
      followers: 0,
      publications: 0,
    }
  }

  return transformProfile()
}
