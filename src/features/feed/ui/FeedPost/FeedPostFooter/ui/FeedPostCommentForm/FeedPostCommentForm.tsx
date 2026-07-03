'use client'

import type { Control, UseFormHandleSubmit } from 'react-hook-form'

import { forwardRef } from 'react'

import { ControlledInput } from '@/features/formControls'
import { COMMENT_CONTENT_MAX, type CommentFormData } from '@/shared/types'
import { Button } from '@/shared/ui'

import s from './FeedPostCommentForm.module.scss'

type Props = {
  control: Control<CommentFormData>
  handleSubmit: UseFormHandleSubmit<CommentFormData>
  isCommentInvalid: boolean
  isPublishing: boolean
  onSubmit: (data: CommentFormData) => Promise<void>
}

export const FeedPostCommentForm = forwardRef<HTMLFormElement, Props>(
  ({ control, handleSubmit, isCommentInvalid, isPublishing, onSubmit }, ref) => (
    <form ref={ref} className={s.commentForm} onSubmit={handleSubmit(onSubmit)}>
      <div className={s.commentInputWrapper}>
        <ControlledInput
          name={'comment'}
          control={control}
          inputType={'text'}
          placeholder={'Add a Comment'}
          className={s.input}
          maxLength={COMMENT_CONTENT_MAX}
          disabled={isPublishing}
        />
        {isPublishing && <span className={s.replyLoader} aria-hidden={'true'} />}
      </div>

      <Button variant={'text'} type={'submit'} disabled={isCommentInvalid || isPublishing}>
        Publish
      </Button>
    </form>
  )
)

FeedPostCommentForm.displayName = 'FeedPostCommentForm'
