import React from 'react'

import { Button, Modal, Typography } from '@/shared/ui'

import s from '../EditMode.module.scss'

interface ExitConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      modalTitle={'Close Post'}
      className={s.exitConfirmationDialog}
    >
      <div className={s.exitConfirmationContent}>
        <Typography variant={'regular_16'}>
          Do you really want to close the edition of the publication?
          <br />
          If you close changes won&apos;t be saved
        </Typography>

        <div className={s.exitConfirmationActions}>
          <Button variant={'outlined'} onClick={onConfirm}>
            Yes
          </Button>
          <Button variant={'primary'} onClick={onClose}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  )
}
