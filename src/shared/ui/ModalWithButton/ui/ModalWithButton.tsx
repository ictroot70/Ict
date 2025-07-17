'use client'

import React from 'react'

import s from './ModalWithButton.module.scss'
import { Button, Modal, Typography } from '@/shared/ui'

interface Props {
  title: string
  message: string
  isOpen: boolean
  onCloseAction: () => void
}

export const ModalWithButton = ({ title, message, isOpen, onCloseAction }: Props) => {
  return (
    <Modal open={isOpen} onClose={onCloseAction} modalTitle={title} className={s.modal}>
      <div className={s.content}>
        <Typography variant="regular_16">{message}</Typography>
        <Button onClick={onCloseAction}>OK</Button>
      </div>
    </Modal>
  )
}
