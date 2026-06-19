'use client'

import React from 'react'

import { Button, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface ReplyFormProps {
  value: string
  onChange: (val: string) => void
  onCancel: () => void
  onSubmit: () => void
  placeholder: string
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  value,
  onChange,
  onCancel,
  onSubmit,
  placeholder,
}) => {
  const isValid = value.trim().length >= 1 && value.length <= 300
  const isTooLong = value.length > 300

  return (
    <div className={s.replyContainer}>
      <div className={s.replyInputWrapper}>
        <input
          type={'text'}
          className={s.replyInput}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
          maxLength={300}
        />
        {isTooLong && (
          <Typography variant={'small_text'} color={'danger'} className={s.charLimitError}>
            Максимум 300 символов
          </Typography>
        )}
      </div>

      <div className={s.replyActions}>
        <Button variant={'text'} onClick={onCancel} className={s.cancelButton}>
          Отмена
        </Button>
        <Button
          variant={'primary'}
          onClick={onSubmit}
          disabled={!isValid}
          className={s.submitButton}
        >
          Ответить
        </Button>
      </div>
    </div>
  )
}
