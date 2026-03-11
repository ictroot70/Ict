import type { PostViewModel } from '@/shared/types'

type Props = { postId: number; post: PostViewModel | null }

export const usePostEdit = ({ postId }: Props) => {
  return {
    isEditing: false,
    start: () => {},
    cancel: () => {},
    save: async (_description: string) => true,
  }
}
