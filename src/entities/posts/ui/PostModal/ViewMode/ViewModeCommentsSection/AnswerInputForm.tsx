// 'use client'

// import React from 'react'
// import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

// import { ControlledInput } from '@/features/formControls'
// import { AnswerFormSchema, COMMENT_CONTENT_MAX } from '@/shared/types/comments'
// import { Button } from '@/shared/ui'

// import s from '../ViewMode.module.scss'

// interface AnswerInputFormProps {
//   control: Control<AnswerFormSchema>
//   handleSubmit: UseFormHandleSubmit<AnswerFormSchema>
//   watch: UseFormWatch<AnswerFormSchema>
//   onSubmit: (data: AnswerFormSchema) => Promise<void>
//   isSubmitting: boolean
//   className?: string
// }

// export const AnswerInputForm: React.FC<AnswerInputFormProps> = ({
//   control,
//   handleSubmit,
//   watch,
//   onSubmit,
//   isSubmitting,
//   className,
// }) => {
//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className={className ?? s.replyInputForm}>
//       <ControlledInput
//         name={'answer'}
//         control={control}
//         inputType={'text'}
//         placeholder={'Write an answer...'}
//         className={s.input}
//         maxLength={COMMENT_CONTENT_MAX}
//       />
//       <Button
//         variant={'text'}
//         type={'submit'}
//         className={s.publishButton}
//         disabled={!watch('answer')?.trim() || isSubmitting}
//       >
//         Publish
//       </Button>
//     </form>
//   )
// }

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

export const AnswerInputForm: React.FC<AnswerInputFormProps> = ({
  control,
  handleSubmit,
  watch,
  onSubmit,
  isSubmitting,
  className,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className ?? s.replyInputForm}>
      <ControlledInput
        name={'answer'}
        control={control}
        inputType={'text'}
        placeholder={'Write an answer...'}
        className={s.input}
        maxLength={COMMENT_CONTENT_MAX}
      />
      <Button
        variant={'text'}
        type={'submit'}
        className={s.publishButton}
        disabled={!watch('answer')?.trim() || isSubmitting}
      >
        Publish
      </Button>
    </form>
  )
}
