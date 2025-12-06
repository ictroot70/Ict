import { AvatarView } from '@/entities/profile'

export interface UserBase {
  id: number
  userName: string
  avatars: AvatarView[]
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

export interface PublicProfileResponse {
  id: number
  userName: string
  aboutMe: string | null
  avatars: AvatarView[]
  userMetadata: UserMetadata
  isFollowing: boolean
  isFollowedBy: boolean
}

export interface ProfileWithPostsResponse {
  aboutMe: string
  avatars: AvatarView[]
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

export type ProfileType = FullProfileResponse | PublicProfileResponse | ProfileWithPostsResponse

export const isFullProfile = (profile: ProfileType): profile is FullProfileResponse => {
  return (
    'followingCount' in profile && 'followersCount' in profile && 'publicationsCount' in profile
  )
}

export const isPublicProfile = (profile: ProfileType): profile is PublicProfileResponse => {
  return 'userMetadata' in profile
}

export const isProfileWithPosts = (profile: ProfileType): profile is ProfileWithPostsResponse => {
  return 'followersCount' in profile && 'firstName' in profile && !('userMetadata' in profile)
}

export interface UserInfo {
  id: number
  userName: string
  avatar?: string
  firstName?: string
  lastName?: string
}

export interface MeViewDto {
  userId: number
  userName: string
  email: string
  isBlocked: boolean
}

export interface SessionViewModel {
  deviceId: number
  ip: string
  lastActive: string
  browserName: string
  browserVersion: string
  deviceName: string
  osName: string
  osVersion: string
  deviceType: string
}

export interface GetAllUserSessionsResponseDto {
  current: SessionViewModel
  others: SessionViewModel[]
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
  avatars: AvatarView[]
  createdAt?: string
}

export interface UpdateProfileInputDto {
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

export interface ProfileViewAfterSearchModel extends UserBase {
  firstName: string
  lastName: string
  createdAt: string
}

export interface UserWithPaginationViewDto {
  totalCount: number
  pagesCount: number
  page: number
  pageSize: number
  prevCursor: number
  nextCursor: number
  items: ProfileViewAfterSearchModel[]
}

export interface UserSubscriptionInputDto {
  selectedUserId: number
}

export interface UserFollowingFollowersViewModel extends UserBase {
  userId: number
  createdAt: string
  isFollowing: boolean
  isFollowedBy: boolean
}

export interface FollowingWithPaginationViewModel {
  totalCount: number
  pagesCount: number
  page: number
  pageSize: number
  prevCursor: number
  nextCursor: number
  items: UserFollowingFollowersViewModel[]
}

export interface ResponseCountRegisteredUsers {
  totalCount: number
}

export interface AvatarsViewModel {
  avatars: AvatarView[]
}
