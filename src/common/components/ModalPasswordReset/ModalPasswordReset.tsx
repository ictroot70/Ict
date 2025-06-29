import React, { useEffect } from 'react'

import s from './ModalPasswordReset.module.scss'
import { Button, Typography } from '@/shared'

interface ModalPasswordResetProps {
  isOpen: boolean
  onClose: () => void
}

const ModalPasswordReset = ({ isOpen, onClose }: ModalPasswordResetProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <button className={s.closeButton} onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <Typography variant="h1" className={s.title}>
          Password Restored
        </Typography>

        <Typography variant="regular_16" className={s.text}>
          Great news! Your password has been successfully recovered and reset. You can now sign in
          to your account using your new password.
        </Typography>

        <Button className={s.confirmButton} onClick={onClose}>
          ОК
        </Button>
      </div>
    </div>
  )
}

export default ModalPasswordReset
