export interface ProfileData {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: Avatar[]
  createdAt?: string
}

export interface PublicProfileData {
  id: number
  userName: string
  aboutMe: null | string
  avatars: Avatar[]
  userMetadata: UserMetadata
  isFollowing: boolean
  isFollowedBy: boolean
}

export interface Avatar {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
}

export interface UserMetadata {
  followers: number
  following: number
  publications: number
}
export interface ProfileUpdateRequest {
  userName: string
  firstName: string
  lastName: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string
  aboutMe?: string
}

export interface PublicProfileRequest {
  profileId: number
}
