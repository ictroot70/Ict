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

export interface Owner {
  firstName: string
  lastName: string
}

export interface PostViewModel {
  id: number
  userName: string
  description?: string
  location?: string
  images: PostImageViewModel[]
  createdAt: string
  updatedAt: string
  ownerId: number
  avatarOwner: string
  owner: Owner
  likesCount: number
  isLiked: boolean
  avatarWhoLikes: string[]
}

export interface UpdatePostInputDto {
  description?: string
}

export interface UpdateLikeStatusDto {
  likeStatus: LikeStatus
}

export interface InfinityPaginatedPosts {
  totalCount: number
  pageSize: number
  totalUsers: number
}

export interface AvatarModel {}

export interface ParentViewModel {
  id: number
  username: string
  avatars: AvatarModel[]
}

export interface BaseComment {
  id: number
  from: ParentViewModel
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
