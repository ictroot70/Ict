export interface AvatarViewDto {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string // ISO 8601 format: "2025-07-01T08:15:20.008Z"
}

export interface ProfileViewModel {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: AvatarViewDto[]
  createdAt?: string
}

export interface ProfileUpdateDto {
  userName: string
  firstName: string
  lastName: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string
  aboutMe?: string
}

export interface PublicProfileResponse {
  id: number
  userName: string
  aboutMe: null | string
  avatars: AvatarViewDto[]
  userMetadata: UserMetadata
}

export interface PublicProfileRequest {
  profileId: string
}

export interface UserMetadata {
  followers: number
  following: number
  publications: number
}

export interface ProfileWithPostsResponse {
  aboutMe: string
  avatars: AvatarViewDto[]
  city: string
  country: string
  dateOfBirth: string
  firstName: string
  followersCount: number
  followingCount: number
  id: number
  isFollowedBy: boolean
  isFollowing: boolean
  lastName: string
  publicationsCount: number
  region: string
  userName: string
}

export interface FullProfileResponse {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: AvatarViewDto[]
  isFollowing: boolean
  isFollowedBy: boolean
  followingCount: number
  followersCount: number
  publicationsCount: number
}

export type ProfileType = FullProfileResponse | PublicProfileResponse
