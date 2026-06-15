'use client'

import React from 'react'
import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { AnswerFormSchema, COMMENT_CONTENT_MAX } from '@/shared/types/comments'
import { Button } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface AnswerInputFormProps {
  control: Control<AnswerFormSchema>
  handleSubmit: UseFormHandleSubmit<AnswerFormSchema>
  watch: UseFormWatch<AnswerFormSchema>
  onSubmit: (data: AnswerFormSchema) => Promise<void>
  isSubmitting: boolean
  className?: string
}

const isEffectivelyEmpty = (value: string | undefined) => {
  if (!value) {
    return true
  }

  return value.replace(/@\S+\s*/g, '').trim().length === 0
}

export const AnswerInputForm: React.FC<AnswerInputFormProps> = ({
  control,
  handleSubmit,
  watch,
  onSubmit,
  isSubmitting,
  className,
}) => {
  const answerValue = watch('answer')
  const isDisabled = isEffectivelyEmpty(answerValue) || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className ?? s.replyInputForm}>
      <ControlledInput
        name={'answer'}
        control={control}
        inputType={'text'}
        placeholder={'Add a Reply...'}
        className={s.input}
        maxLength={300}
        autoFocus
      />
      <Button variant={'text'} type={'submit'} className={s.publishButton} disabled={isDisabled}>
        Publish
      </Button>
    </form>
  )
}
