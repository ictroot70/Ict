export interface AvatarDto {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
}

export interface ProfileUpdateDto {
  userName?: string
  firstName?: string
  lastName?: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string | null
  aboutMe?: string
}

export interface ProfileDto {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: AvatarDto[]
  createdAt: string
}

export interface UploadAvatarResponse {
  avatars: AvatarView[]
}

export interface AvatarView {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
}

// TODO: this type must be moved to the public user entity, in next refactoring !!!!!
export interface PublicProfileResponse {
  id: number
  userName: string
  aboutMe: string
  avatars: AvatarView[]
  userMetadata: UserMetadata
  isFollowing: boolean
  isFollowedBy: boolean
}

export interface UserMetadata {
  followers: number
  following: number
  publications: number
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
  avatars: AvatarView[]
  isFollowing: boolean
  isFollowedBy: boolean
  followingCount: number
  followersCount: number
  publicationsCount: number
}

// TODO: this type must be moved to the public user entity, in next refactoring too as PublicProfileResponse !!!!!
export type ProfileType = FullProfileResponse | PublicProfileResponse
