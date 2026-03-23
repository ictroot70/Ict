'use client'

import { useEffect, useState } from 'react'

import { Button, CheckboxRadix, Modal, Typography } from '@/shared/ui'

import s from './PaymentModals.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function AutoRenewModal({ open, onClose, onConfirm }: Props) {
  const [isAgreed, setIsAgreed] = useState(false)

  useEffect(() => {
    if (open) {
      setIsAgreed(false)
    }
  }, [open])

  return (
    <Modal open={open} onClose={onClose} className={s.modal} modalTitle={'Create payment'}>
      <div className={s.content}>
        <Typography variant={'regular_16'}>
          Auto-renewal will be enabled with this payment. You can disable it anytime in your profile
          settings
        </Typography>

        <div className={s.actions}>
          <CheckboxRadix
            className={s.checkbox}
            label={'I agree'}
            checked={isAgreed}
            onCheckedChange={value => setIsAgreed(value === true)}
          />
          <Button onClick={onConfirm} disabled={!isAgreed}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  )
}
