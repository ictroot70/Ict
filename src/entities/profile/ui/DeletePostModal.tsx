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
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isLoading])

  if (!isOpen) return null

  const handleConfirmClick = () => {
    console.log('DeletePostModal: подтверждение удаления')
    onConfirm()
  }

  const handleCancelClick = () => {
    console.log('DeletePostModal: отмена удаления')
    onClose()
  }

  return (
    <div className={s.overlay} onClick={handleCancelClick}>
      <div className={s.modalWrapper}>
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
              onClick={handleCancelClick}
              disabled={isLoading}
            >
              No
            </button>
            <button
              className={`${s.button} ${s.confirmButton}`}
              onClick={handleConfirmClick}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Yes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}