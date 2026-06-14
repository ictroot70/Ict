import { LikeStatus } from '@/shared/types'
import { AnswersViewModel, CommentsViewModel } from '@/shared/types/comments'

export type PostImageViewModel = {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
  uploadId: string
}

export type OwnerViewModel = {
  firstName: string
  lastName: string
}

export type PostViewModel = {
  id: number
  userName: string
  description: string
  location?: string
  images: PostImageViewModel[]
  createdAt: string
  updatedAt: string
  ownerId: number
  avatarOwner: string
  owner: OwnerViewModel
  likesCount: number
  isLiked: boolean
  avatarWhoLikes: string[]
}

export type CreatePostInputDto = {
  description?: string | null
  childrenMetadata: ChildMetadataDto[]
}

export interface ChildMetadataDto {
  uploadId: string
}

export type UpdatePostInputDto = {
  description?: string
}

export type UploadedImageViewModel = {
  images: PostImageViewModel[]
}

export type UpdateLikeStatusDto = {
  likeStatus: LikeStatus
}

export type PostLikeUserViewModel = {
  id: number
  userId: number
  userName: string
  createdAt: string
  avatars: Array<{
    url: string
    width: number
    height: number
    fileSize: number
    createdAt?: string
  }>
  isFollowing: boolean
  isFollowedBy: boolean
}

export type PostLikesResponse = {
  pageSize: number
  totalCount: number
  notReadCount?: number
  items: PostLikeUserViewModel[]
}

export type GetPostLikesParams = {
  postId: number
  pageSize?: number
  pageNumber?: number
  cursor?: number
}

export type PaginatedResponse<T> = {
  items: T[]
  totalCount: number
  pageSize: number
}

export type PaginatedPosts = PaginatedResponse<PostViewModel>

export type CommonPostParams = {
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export type GetPostsByUserParams = CommonPostParams & {
  userId: number
  endCursorPostId?: number
}

export type GetPostsParams = CommonPostParams & {
  param: string
  pageNumber?: number
}

export type PaginatedCommentsResponse = {
  pageSize: number
  totalCount: number
  notReadCount?: number
  items: CommentsViewModel[]
}

export type PaginatedAnswersResponse = {
  pageSize: number
  totalCount: number
  notReadCount?: number
  items: AnswersViewModel[]
}

export type GetCommentsParams = CommonPostParams & {
  postId: number
}

export type GetCommentAnswersParams = CommonPostParams & {
  postId: number
  commentId: number
}
