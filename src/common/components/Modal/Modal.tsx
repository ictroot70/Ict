import React, { useEffect } from 'react'

import s from './Modal.module.scss'
import { Button, Typography } from '@/shared'

interface Props {
  title: string
  message: string
  isOpen: boolean
  onClose: () => void
}

const Modal = ({ title, message, isOpen, onClose }: Props) => {
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
          {title}
        </Typography>

        <Typography variant="regular_16" className={s.text}>
          {message}
        </Typography>

        <Button className={s.confirmButton} onClick={onClose}>
          ОК
        </Button>
      </div>
    </div>
  )
}

export default Modal
