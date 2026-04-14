'use client'
import React, { useEffect, useState } from 'react'

import { Button, CheckboxRadix, Modal, Typography } from '@/shared/ui'
import { useTranslations } from 'next-intl'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export function PaymentConfirmationModal({ open, onClose, onConfirm, isSubmitting }: Props) {
  const t = useTranslations('subscriptions.account')
  const [isAgreed, setIsAgreed] = useState(false)

  useEffect(() => {
    if (open) {
      setIsAgreed(false)
    }
  }, [open])

  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle={t('autoRenewTitle')}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>{t('autoRenewText')}</Typography>

        <div className={s.actions}>
          <CheckboxRadix
            className={s.checkbox}
            label={t('agree')}
            checked={isAgreed}
            onCheckedChange={value => setIsAgreed(value === true)}
          />
          <Button onClick={onConfirm} disabled={!isAgreed || isSubmitting}>
            {isSubmitting ? t('sending') : t('ok')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
