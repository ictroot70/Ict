import { UserImage } from '@/entities/users/api/api.types'

import { LikeStatus } from '../base/enums'
import { UserBase } from '../user/models'

export interface PostImageViewModel {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt?: string
  uploadId: string
}

export interface UploadedImageViewModel {
  images: PostImageViewModel[]
}

export interface ChildMetadataDto {
  uploadId: string
}

export interface CreatePostInputDto {
  description?: string
  childrenMetadata: ChildMetadataDto[]
}

export interface UpdatePostInputDto {
  description?: string
}

export interface UpdateLikeStatusDto {
  likeStatus: LikeStatus
}

export interface PostViewModel {
  id: number
  userName: string
  description?: string
  location?: string
  images: UserImage[]
  createdAt: string
  updatedAt: string
  ownerId: number
  avatarOwner: string
  owner: {
    firstName: string
    lastName: string
  }
  likesCount: number
  isLiked: boolean
  avatarWhoLikes: string[]
}

// Комментарии
export interface BaseComment {
  id: number
  from: UserBase
  content: string
  createdAt: string
  likeCount: number
  isLiked: boolean
}

export interface CommentsViewModel extends BaseComment {
  postId: number
  answerCount: number
}

export interface AnswersViewModel extends BaseComment {
  commentId: number
}

export interface CreateCommentDto {
  content: string
}

export interface PublicationsFollowersWithPaginationViewModel {
  totalCount: number
  pagesCount: number
  page: number
  pageSize: number
  prevCursor: number
  nextCursor: number
  items: PostViewModel[]
}

export type PostVariant = 'public' | 'myPost' | 'userPost'

export interface PostModalHandlers {
  onEditPost?: (postId: string, description: string) => boolean | Promise<boolean>
  onDeletePost?: (postId: string) => void
  onClose: () => void
}

export interface PostFormData {
  description: string
  comment: string
}

export interface DescriptionFormData {
  description: string
}

export interface CommentFormData {
  comment: string
}

export interface PostModalData {
  images: UserImage[]
  userName: string
  avatar: string
  description: string
  createdAt: string
  postId: string
  ownerId?: number
}

export const mapPostToModalData = (post: PostViewModel): PostModalData => ({
  images: post.images,
  userName: post.userName,
  avatar: post.avatarOwner,
  description: post.description || '',
  createdAt: post.createdAt,
  postId: post.id.toString(),
  ownerId: post.ownerId,
})
