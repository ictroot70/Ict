import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { Skeleton } from '@/shared/composites'
import { CommentFormData } from '@/shared/types'
import { Button } from '@/shared/ui'

import s from '../../ViewMode.module.scss'

// Утилита для проверки наличия реального текста (не только mentions)
const hasActualText = (val: string) => {
  const cleaned = val.replace(/@\S+\s*/g, '').trim()

  return cleaned.length > 0
}

interface ViewModeCommentFormProps {
  variant: 'public' | 'myPost' | 'userPost'
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
  isPublishingComment: boolean
  commentMaxLength: number
}
export const ViewModeCommentForm = ({
  variant,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
  isPublishingComment,
  commentMaxLength,
}: ViewModeCommentFormProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const commentValue = watchComment('comment') || ''

  return (
    <div className={s.commentForm}>
      {shouldShowAuthSkeleton ? (
        <div className={s.inputForm} aria-hidden>
          <Skeleton className={s.inputSkeleton} />
          <Skeleton className={s.publishSkeleton} />
        </div>
      ) : (
        shouldShowAuthActions && (
          <form onSubmit={handleCommentSubmit(handlePublish)} className={s.inputForm}>
            <ControlledInput
              name={'comment'}
              control={commentControl}
              inputType={'text'}
              placeholder={'Add a Comment...'}
              className={s.input}
              maxLength={commentMaxLength}
            />
            <Button
              variant={'text'}
              type={'submit'}
              className={s.publishButton}
              disabled={!hasActualText(commentValue) || isPublishingComment}
            >
              Publish
            </Button>
          </form>
        )
      )}
    </div>
  )
}
