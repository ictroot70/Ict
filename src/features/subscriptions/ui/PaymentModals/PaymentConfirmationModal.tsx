'use client'
import React, { useEffect, useState } from 'react'

import { Button, CheckboxRadix, Modal, Typography } from '@/shared/ui'
import { clsx } from 'clsx'
import { useTranslations } from 'next-intl'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPaymentCreating?: boolean
}

export function PaymentConfirmationModal({
  open,
  onClose,
  onConfirm,
  isPaymentCreating = false,
}: Props) {
  const t = useTranslations('subscriptions.account')
  const [isAgreed, setIsAgreed] = useState(false)

  useEffect(() => {
    if (open) {
      setIsAgreed(false)
    }
  }, [open])

  const handleClose = () => {
    if (isPaymentCreating) {
      return
    }

    onClose()
  }

  const renderPaymentCreationState = () => (
    <span
      className={clsx(s.processingSpinner, s.paymentCreationSpinner)}
      aria-label={t('paymentCreationInProgress')}
      role={'status'}
    />
  )

  const renderConfirmationActions = () => (
    <>
      <CheckboxRadix
        className={s.checkbox}
        label={t('agree')}
        checked={isAgreed}
        onCheckedChange={value => setIsAgreed(value === true)}
      />
      <Button onClick={onConfirm} disabled={!isAgreed}>
        {t('ok')}
      </Button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={clsx(s.modal, isPaymentCreating && s.modalLocked)}
      modalTitle={t('autoRenewTitle')}
    >
      <div className={s.content}>
        <Typography variant={'regular_16'}>
          {isPaymentCreating ? t('paymentCreationStarted') : t('autoRenewText')}
        </Typography>

        <div className={clsx(s.actions, isPaymentCreating && s.actionsCentered)}>
          {isPaymentCreating ? renderPaymentCreationState() : renderConfirmationActions()}
        </div>
      </div>
    </Modal>
  )
}
