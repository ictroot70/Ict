import { AnswersViewModel, CommentsViewModel } from '@/shared/types/comments'

export const sortComments = (
  comments: CommentsViewModel[],
  currentUserId?: number
): CommentsViewModel[] => {
  return [...comments].sort((a, b) => {
    if (currentUserId) {
      const aOwn = a.from.id === currentUserId
      const bOwn = b.from.id === currentUserId

      if (aOwn !== bOwn) {
        return aOwn ? -1 : 1
      }
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
