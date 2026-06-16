export type GetPublicPostsResponse = {
  items: PublicPostResponse[]
  pageSize: number
  totalCount: number
  totalUsers: number
}

export type SearchUsersRequest = {
  search: string
}

export type FollowUserRequest = {
  selectedUserId: number
}

// Authenticated endpoint GET /v1/users/{userName} — returns per-viewer follow status.
export type UserByUserNameResponse = {
  id: number
  userName: string
  firstName: string | null
  lastName: string | null
  aboutMe: string | null
  avatars: UserImage[]
  isFollowing: boolean
  isFollowedBy: boolean
  followingCount: number
  followersCount: number
  publicationsCount: number
}

export type SearchUsersResponse = {
  items: SearchUserItem[]
  totalCount: number
}

export type SearchUserItem = {
  id: number
  userName: string
  firstName: string | null
  lastName: string | null
  avatars: UserImage[]
}

export type PublicPostResponse = {
  avatarOwner?: string
  avatarWhoLikes: string[]
  createdAt: string
  description: string
  id: number
  images: UserImage[]
  isLiked: boolean
  likesCount: number
  location: null | string
  owner: Owner
  ownerId: number
  updatedAt: string
  userName: string
}

export type Owner = {
  firstName: null | string
  lastName: null | string
}

export type UserImage = {
  createdAt: string
  fileSize: number
  height: number
  uploadId: string
  url: string
  width: number
}

export type GetPublicPostsRequest = {
  endCursorPostId?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: string
}
