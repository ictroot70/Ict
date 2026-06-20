import { UserBase } from '../user/models'

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
