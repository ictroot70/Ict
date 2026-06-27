import { UserImage } from '@/entities/users/api/api.types'

import { LikeStatus } from '../base/enums'

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

export type PostVariant = 'public' | 'myPost' | 'userPost'

export interface PostModalHandlers {
  onEditPost?: (postId: number, description: string) => boolean | Promise<boolean>
  onDeletePost?: (postId: number) => void
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
  id: number
  images: UserImage[]
  userName: string
  avatar: string
  description: string
  createdAt: string
  ownerId?: number
  likesCount: number
  isLiked: boolean
  avatarWhoLikes: string[]
}

export const mapPostToModalData = (post: PostViewModel): PostModalData => ({
  images: post.images,
  userName: post.userName,
  avatar: post.avatarOwner,
  description: post.description || '',
  createdAt: post.createdAt,
  id: post.id,
  ownerId: post.ownerId,
  likesCount: post.likesCount,
  isLiked: post.isLiked,
  avatarWhoLikes: post.avatarWhoLikes ?? [],
})
