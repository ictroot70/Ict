'use client'

import React from 'react'

import s from './ModalWithButton.module.scss'
import { Button, Modal, Typography } from '@/shared/ui'

interface Props {
  title: string
  message: string
  isOpen: boolean
  onClose: () => void
}

export const ModalWithButton = ({ title, message, isOpen, onClose }: Props) => {
  return (
    <Modal open={isOpen} onClose={onClose} modalTitle={title} className={s.modal}>
      <div className={s.content}>
        <Typography variant="regular_16">{message}</Typography>
        <Button onClick={onClose}>OK</Button>
      </div>
    </Modal>
  )
}
