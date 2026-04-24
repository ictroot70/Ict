'use client'

import React from 'react'

import { Modal, Typography } from '@/shared/ui'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
}

export function PaymentProcessingModal({ open }: Props) {
  return (
    <Modal
      open={open}
      onClose={() => void 0}
      className={s.modal}
      modalTitle={'Processing payment...'}
    >
      <div className={s.processingContent} data-testid={'payment-processing-modal'}>
        <span className={s.processingSpinner} aria-label={'Processing payment'} role={'status'} />
        <Typography variant={'regular_16'}>Please wait while we confirm your payment.</Typography>
      </div>
    </Modal>
  )
}
