
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
  isLoading = false
}: DeletePostModalProps): ReactElement => {

  const handleConfirmClick = () => {
    console.log('DeletePostModal: подтверждение удаления')
    onConfirm()
  }

  const handleCancelClick = () => {
    console.log('DeletePostModal: отмена удаления')
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      modalTitle="Delete Post"
      className={s.modal}
    >
      <div className={s.content}>
        <Typography variant="regular_16" className={s.message}>
          Are you sure you want to delete this post?
        </Typography>

        <div className={s.actions}>
          <Button
            variant="outlined"
            onClick={handleCancelClick}
            disabled={isLoading}
            className={s.cancelButton}
          >
            No
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmClick}
            disabled={isLoading}
            className={s.confirmButton}
          >
            {isLoading ? 'Deleting...' : 'Yes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}