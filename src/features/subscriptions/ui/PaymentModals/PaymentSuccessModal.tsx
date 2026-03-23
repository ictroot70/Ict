'use client'

import { Button, Modal, Typography } from '@/shared/ui'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
}

export function PaymentSuccessModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle={'Success'}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>Payment was successful!</Typography>
        <div className={s.actions}>
          <Button onClick={onClose} fullWidth>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  )
}
