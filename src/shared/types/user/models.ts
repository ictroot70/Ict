import { AvatarViewDto, CursorPagination } from '../base/common'

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
  firstName: string | null
  lastName: string | null
  city: string | null
  country: string | null
  region: string | null
  dateOfBirth: string | null
  aboutMe: string | null
  avatars: AvatarViewDto[]
  createdAt: string
}

export interface UpdateProfileInputDto {
  userName: string
  firstName: string
  lastName: string
  city?: string | null
  country?: string | null
  region?: string | null
  dateOfBirth?: string
  aboutMe?: string | null
}

export interface ResponseCountRegisteredUsers {
  totalCount: number
}

export interface AvatarsViewModel {
  avatars: AvatarViewDto[]
}

export interface UserMetadata {
  following: number
  followers: number
  publications: number
}

export interface PublicProfileViewModel {
  id: number
  userName: string
  aboutMe: string
  avatars: AvatarViewDto[]
  userMetadata: UserMetadata
  hasPaymentSubscription: boolean
}

export interface ProfileViewAfterSearchModel {
  id: number
  userName: string
  firstName: string
  lastName: string
  avatars: AvatarViewDto[]
  createdAt: string
}

export interface UserWithPaginationViewDto extends CursorPagination {
  items: ProfileViewAfterSearchModel[]
}

export interface ProfileWithPostsViewModel {
  id: number
  userName: string
  firstName: string | null
  lastName: string | null
  city: string | null
  country: string | null
  region: string | null
  dateOfBirth: string | null
  aboutMe: string | null
  avatars: AvatarViewDto[]
  isFollowing: boolean
  isFollowedBy: boolean
  followingCount: number
  followersCount: number
  publicationsCount: number
}

export interface UserSubscriptionInputDto {
  selectedUserId: number
}

export interface UserFollowingFollowersViewModel {
  id: number
  userId: number
  userName: string
  createdAt: string
  avatars: AvatarViewDto[]
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
