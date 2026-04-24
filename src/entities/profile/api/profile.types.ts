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
export type ProfileDto = ProfileData

export interface PublicProfileData {
  id: number
  userName: string
  aboutMe: null | string
  avatars: Avatar[]
  userMetadata: UserMetadata
  isFollowing: boolean
  isFollowedBy: boolean
}
export type PublicProfileResponse = PublicProfileData

export interface Avatar {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
}
export type AvatarDto = Avatar

export interface UserMetadata {
  followers: number
  following: number
  publications: number
}
export interface ProfileUpdateRequest {
  userName?: string
  firstName?: string
  lastName?: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: null | string
  aboutMe?: string
}
export type ProfileUpdateDto = ProfileUpdateRequest

export interface UploadAvatarResponse {
  avatars: Avatar[]
}

export interface PublicProfileRequest {
  profileId: number
}

export interface FullProfileResponse extends ProfileData {
  isFollowing: boolean
  isFollowedBy: boolean
  followingCount: number
  followersCount: number
  publicationsCount: number
}

export type ProfileType = FullProfileResponse | PublicProfileResponse
