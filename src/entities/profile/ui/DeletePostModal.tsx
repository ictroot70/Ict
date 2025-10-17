'use client'

import { ReactElement } from 'react'
import { Typography } from '@/shared/ui'
import s from './DeletePostModal.module.scss'

interface DeletePostModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  postId: string
  isLoading?: boolean
}

export const DeletePostModal = ({
  isOpen,
  onClose,
  onConfirm,
  postId,
  isLoading = false
}: DeletePostModalProps): ReactElement => {

  if (!isOpen) return null

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header с линией */}
        <div className={s.header}>
          <Typography variant="h1" className={s.title}>
            Delete Post
          </Typography>
        </div>

        {/* Сообщение */}
        <Typography variant="regular_16" className={s.message}>
          Are you sure you want to delete this post?
        </Typography>

        {/* Кнопки прижаты к правому краю */}
        <div className={s.actions}>
          <button
            className={`${s.button} ${s.cancelButton}`}
            onClick={onClose}
            disabled={isLoading}
          >
            No
          </button>
          <button
            className={`${s.button} ${s.confirmButton}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  )
}