'use client'

import { Button, Modal, Typography } from '@/shared/ui'

import s from './DeleteAvatarModal.module.scss'

interface DeleteAvatarModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteAvatarModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: Readonly<DeleteAvatarModalProps>) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      modalTitle={'Delete Profile Photo'}
      className={s.deleteModal}
    >
      <div className={s.deleteContent}>
        <Typography variant={'regular_16'}>
          Do you really want to delete your profile photo?
        </Typography>
        <div className={s.deleteActions}>
          <Button variant={'outlined'} onClick={onConfirm} disabled={isSubmitting}>
            {getConfirmButtonText(isSubmitting)}
          </Button>
          <Button onClick={onClose} disabled={isSubmitting}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  )
}
function getConfirmButtonText(isSubmitting: boolean) {
  if (isSubmitting) {
    return 'Deleting...'
  }

  return 'Yes'
}
