// DeletePostModal.tsx
'use client'

import { ReactElement, useEffect } from 'react'
import { Typography } from '@/shared/ui'
import s from './DeletePostModal.module.scss'

interface DeletePostModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const DeletePostModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: DeletePostModalProps): ReactElement => {

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <Typography variant="h1" className={s.title}>
            Delete Post
          </Typography>
        </div>

        <Typography variant="regular_16" className={s.message}>
          Are you sure you want to delete this post?
        </Typography>

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