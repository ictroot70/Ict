'use client'

import type { BaseSyntheticEvent, FC } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { ReplyFormData } from '@/shared/types/comments'
import { Button } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface ReplyFormProps {
  replyForm: UseFormReturn<ReplyFormData>
  isSubmitting: boolean
  authorName: string
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>
  onCancel: () => void
}

export const ReplyForm: FC<ReplyFormProps> = ({
  replyForm,
  isSubmitting,
  authorName,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className={s.replyContainer}>
      <div className={s.inputWrapper}>
        <ControlledInput
          name={'content'}
          control={replyForm.control}
          inputType={'text'}
          placeholder={`Reply to @${authorName}...`}
          className={s.inlineInput}
          disabled={isSubmitting}
          autoFocus
        />
      </div>
      <div className={s.replyActions}>
        <Button variant={'text'} onClick={onCancel} type={'button'} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant={'primary'}
          type={'submit'}
          disabled={!replyForm.watch('content')?.trim() || isSubmitting}
        >
          Answer
        </Button>
      </div>
    </form>
  )
}
