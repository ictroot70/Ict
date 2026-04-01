'use client'

import React from 'react'
import { Button, Modal, Typography } from '@/shared/ui'
import { useTranslations } from 'next-intl'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  onBackToPayment: () => void
}

export function PaymentFailureModal({ open, onClose, onBackToPayment }: Props) {
  const t = useTranslations('subscriptions.account')

  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle={t('errorTitle')}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>{t('errorText')}</Typography>
        <div className={s.actions}>
          <Button onClick={onBackToPayment} fullWidth>
            {t('backToPayment')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
