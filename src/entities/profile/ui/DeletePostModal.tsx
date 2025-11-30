'use client'

import { ReactElement } from 'react'

import { Button, Typography } from '@/shared/ui'
import { Modal } from '@/shared/ui/Modal'

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
  isLoading = false,
}: DeletePostModalProps): ReactElement => {
  const handleConfirmClick = () => {
    onConfirm()
  }

  const handleCancelClick = () => {
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onClose} modalTitle={'Delete Post'} className={s.modal}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>Are you sure you want to delete this post?</Typography>

        <div className={s.actions}>
          <Button variant={'outlined'} onClick={handleConfirmClick} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Yes'}
          </Button>
          <Button variant={'primary'} onClick={handleCancelClick} disabled={isLoading}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  )
}
