import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'

interface ReplyFormData {
  content: string
}

interface UseReplyFormReturn {
  isReplying: boolean
  replyForm: UseFormReturn<ReplyFormData>
  handleStartReply: () => void
  handleCancelReply: () => void
  handleSubmitReply: (
    onSubmit: (content: string) => Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
}

export const useReplyForm = (): UseReplyFormReturn => {
  const [isReplying, setIsReplying] = useState(false)

  const replyForm = useForm<ReplyFormData>({
    defaultValues: { content: '' },
  })

  const handleStartReply = () => setIsReplying(true)

  const handleCancelReply = () => {
    setIsReplying(false)
    replyForm.reset()
  }

  const handleSubmitReply = (onSubmit: (content: string) => Promise<void>) =>
    replyForm.handleSubmit(async data => {
      if (!data.content.trim()) {
        return
      }
      await onSubmit(data.content.trim())
      handleCancelReply()
    })

  return {
    isReplying,
    replyForm,
    handleStartReply,
    handleCancelReply,
    handleSubmitReply,
  }
}
