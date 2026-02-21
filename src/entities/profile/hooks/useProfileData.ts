import { ProfileType, AvatarDto } from '../api'
import { isFullProfile, isPublicProfile } from '../model/type-guards'

interface ProfileData {
  userName: string
  fullName?: string
  aboutMe: string
  avatars: AvatarDto[]
  following: number
  followers: number
  publications: number
  isFollowing?: boolean
  isFollowedBy?: boolean
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
        isFollowedBy: profile.isFollowedBy,
        isFollowing: profile.isFollowing,
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
        isFollowedBy: profile.isFollowedBy,
        isFollowing: profile.isFollowing,
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
