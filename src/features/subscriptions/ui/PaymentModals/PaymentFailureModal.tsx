'use client'

import { Button, Modal, Typography } from '@/shared/ui'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  onBackToPayment: () => void
}

export function PaymentFailureModal({ open, onClose, onBackToPayment }: Props) {
  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle="Error">
      <div className={s.content}>
        <Typography variant={'regular_16'}>Transaction failed, please try again</Typography>
        <div className={s.actions}>
          <Button onClick={onBackToPayment} fullWidth>
            Back to payment
          </Button>
        </div>
      </div>
    </Modal>
  )
}
