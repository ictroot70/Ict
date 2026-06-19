import { useCreateCommentAnswerMutation } from '../api/postCommentsApi'

export const useSendCommentAnswer = (postId: number) => {
  const [createAnswer, { isLoading }] = useCreateCommentAnswerMutation()

  const sendAnswer = async (commentId: number, content: string) => {
    try {
      await createAnswer({
        postId,
        commentId,
        content,
      }).unwrap()
    } catch (error) {
      console.error('Failed to send answer:', error)
    }
  }

  return {
    sendAnswer,
    isLoading,
  }
}
