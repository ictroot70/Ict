'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { Button } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface ReplyFormData {
  content: string
}

interface ReplyFormProps {
  replyForm: UseFormReturn<ReplyFormData>
  isSubmitting: boolean
  authorName: string
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  onCancel: () => void
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
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
          Reply
        </Button>
      </div>
    </form>
  )
}
