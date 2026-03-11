import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import type { PostViewModel } from '@/shared/types'

type Props = { postId: number; initialPost?: PostViewModel | null; enabled?: boolean }

export const usePostData = ({ postId, initialPost, enabled = true }: Props) => {
  const skip = !enabled || !!initialPost
  const { data, isFetching, isError } = useGetPostByIdQuery(postId, { skip })
  const post = initialPost ?? data ?? null

  return { post, isLoading: enabled && isFetching && !initialPost, isError }
}
