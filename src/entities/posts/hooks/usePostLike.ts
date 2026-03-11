import type { PostViewModel } from '@/shared/types'

type Input = { postId: number; post: PostViewModel | null }

export const usePostLike = ({ postId, post }: Input) => {
  const count = post?.likesCount ?? 0
  const isLiked = post?.isLiked ?? false

  return {
    count,
    isLiked,
    toggle: async () => {
      // useUpdateLikeStatusMutation -> invalidateTags or optimistic update
    },
  }
}
