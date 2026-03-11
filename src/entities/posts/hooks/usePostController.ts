import type { PostViewModel, CommentsViewModel } from '@/shared/types'
import { usePostData } from './usePostData'
import { usePostComments } from './usePostComments'
import { usePostLike } from './usePostLike'
import { usePostEdit } from './usePostEdit'

export type UsePostControllerInput = {
  postId: number
  initialPost?: PostViewModel | null
  enabled?: boolean
}

export type UsePostControllerResult = {
  post: PostViewModel | null
  isLoading: boolean
  isError: boolean

  comments: CommentsViewModel[]
  isCommentsLoading: boolean
  isCommentsError: boolean

  like: {
    count: number
    isLiked: boolean
    toggle: () => Promise<void>
  }

  commentForm: {
    value: string
    setValue: (v: string) => void
    submit: () => Promise<void>
    canSubmit: boolean
  }

  edit: {
    isEditing: boolean
    start: () => void
    cancel: () => void
    save: (description: string) => Promise<boolean>
  }
}

// usePostController.ts
export const usePostController = (input: UsePostControllerInput): UsePostControllerResult => {
  const { post, isLoading, isError } = usePostData(input)
  const commentsState = usePostComments({ postId: input.postId, enabled: !!post })
  const likeState = usePostLike({ post, postId: input.postId })
  const editState = usePostEdit({ post, postId: input.postId })

  return {
    post,
    isLoading,
    isError,
    ...commentsState,
    like: likeState,
    edit: editState,
  }
}
