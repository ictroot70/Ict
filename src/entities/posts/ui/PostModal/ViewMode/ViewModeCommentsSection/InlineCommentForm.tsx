'use client'

import React from 'react'
import { Control, UseFormHandleSubmit, FieldValues, Path } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { Button } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface InlineCommentFormProps<T extends FieldValues> {
  control: Control<T>
  handleSubmit: UseFormHandleSubmit<T>
  onSubmit: (data: T) => void
  onCancel: () => void
  name: Path<T>
  placeholder?: string
  isSubmitting?: boolean
}

export const InlineCommentForm = <T extends FieldValues>({
  control,
  handleSubmit,
  onSubmit,
  onCancel,
  name,
  placeholder = 'Add a comment...',
  isSubmitting,
}: InlineCommentFormProps<T>) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s.replyContainer}>
      <div className={s.inputWrapper}>
        <ControlledInput
          name={name}
          control={control}
          inputType={'text'}
          placeholder={placeholder}
          className={s.inlineInput}
          disabled={isSubmitting}
        />
      </div>

      <div className={s.replyActions}>
        <Button
          variant={'text'}
          onClick={onCancel}
          type={'button'}
          disabled={isSubmitting}
          className={s.cancelButton}
        >
          Cancel
        </Button>
        <Button
          variant={'primary'}
          type={'submit'}
          disabled={isSubmitting}
          className={s.submitButton}
        >
          Reply
        </Button>
      </div>
    </form>
  )
}
