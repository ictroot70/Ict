// import { AvatarViewDto, CursorPagination } from '../base/common'

import { AvatarViewDto } from '@/entities/profile'

// export interface MeViewDto {
//   userId: number
//   userName: string
//   email: string
//   isBlocked: boolean
// }

// export interface SessionViewModel {
//   deviceId: number
//   ip: string
//   lastActive: string
//   browserName: string
//   browserVersion: string
//   deviceName: string
//   osName: string
//   osVersion: string
//   deviceType: string
// }

// export interface GetAllUserSessionsResponseDto {
//   current: SessionViewModel
//   others: SessionViewModel[]
// }

// export interface ProfileViewModel {
//   id: number
//   userName: string
//   firstName: string | null
//   lastName: string | null
//   city: string | null
//   country: string | null
//   region: string | null
//   dateOfBirth: string | null
//   aboutMe: string | null
//   avatars: AvatarViewDto[]
//   createdAt: string
// }

// export interface UpdateProfileInputDto {
//   userName: string
//   firstName: string
//   lastName: string
//   city?: string | null
//   country?: string | null
//   region?: string | null
//   dateOfBirth?: string
//   aboutMe?: string | null
// }

// export interface ResponseCountRegisteredUsers {
//   totalCount: number
// }

// export interface AvatarsViewModel {
//   avatars: AvatarViewDto[]
// }

// export interface UserMetadata {
//   following: number
//   followers: number
//   publications: number
// }

// export interface PublicProfileViewModel {
//   id: number
//   userName: string
//   aboutMe: string
//   avatars: AvatarViewDto[]
//   userMetadata: UserMetadata
//   hasPaymentSubscription: boolean
// }

// export interface ProfileViewAfterSearchModel {
//   id: number
//   userName: string
//   firstName: string
//   lastName: string
//   avatars: AvatarViewDto[]
//   createdAt: string
// }

// export interface UserWithPaginationViewDto extends CursorPagination {
//   items: ProfileViewAfterSearchModel[]
// }

// export interface ProfileWithPostsViewModel {
//   id: number
//   userName: string
//   firstName: string | null
//   lastName: string | null
//   city: string | null
//   country: string | null
//   region: string | null
//   dateOfBirth: string | null
//   aboutMe: string | null
//   avatars: AvatarViewDto[]
//   isFollowing: boolean
//   isFollowedBy: boolean
//   followingCount: number
//   followersCount: number
//   publicationsCount: number
// }

// export interface UserSubscriptionInputDto {
//   selectedUserId: number
// }

// export interface UserFollowingFollowersViewModel {
//   id: number
//   userId: number
//   userName: string
//   createdAt: string
//   avatars: AvatarViewDto[]
//   isFollowing: boolean
//   isFollowedBy: boolean
// }

// export interface FollowingWithPaginationViewModel {
//   totalCount: number
//   pagesCount: number
//   page: number
//   pageSize: number
//   prevCursor: number
//   nextCursor: number
//   items: UserFollowingFollowersViewModel[]
// }import { AvatarViewDto } from '../base/common'

// Базовые типы пользователей
export interface UserBase {
  id: number
  userName: string
  avatars: AvatarViewDto[]
}

// Метаданные пользователя
export interface UserMetadata {
  followers: number
  following: number
  publications: number
}

// Полный профиль
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

// Публичный профиль
export interface PublicProfileResponse {
  id: number
  userName: string
  aboutMe: string | null
  avatars: AvatarViewDto[]
  userMetadata: UserMetadata
  isFollowing: boolean
  isFollowedBy: boolean
}

// Профиль с постами
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

// Универсальный тип профиля для компонентов
export type ProfileType = FullProfileResponse | PublicProfileResponse | ProfileWithPostsResponse

// Type guards
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
  avatars: AvatarViewDto[]
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
  avatars: AvatarViewDto[]
}
