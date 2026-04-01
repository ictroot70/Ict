'use client'

import React from 'react'
import { Button, Modal, Typography } from '@/shared/ui'
import { useTranslations } from 'next-intl'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
}

export function PaymentSuccessModal({ open, onClose }: Props) {
  const t = useTranslations('subscriptions.account')

  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle={t('successTitle')}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>{t('successText')}</Typography>
        <div className={s.actions}>
          <Button onClick={onClose} fullWidth>
            {t('ok')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
