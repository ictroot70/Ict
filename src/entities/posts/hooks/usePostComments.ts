// usePostComments.ts
import type { CommentsViewModel } from '@/shared/types'

type Input = { postId: number; enabled: boolean }

export const usePostComments = ({ postId, enabled }: Input) => {
  // useGetPostCommentsQuery / useCreateCommentMutation
  return {
    comments: [] as CommentsViewModel[],
    isCommentsLoading: false,
    isCommentsError: false,
    commentForm: {
      value: '',
      setValue: (_v: string) => {},
      submit: async () => {},
      canSubmit: false,
    },
  }
}
