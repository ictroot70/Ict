'use client'

import { Alert, AlertType, variantType, useProgressBar } from '@/shared/ui'
import { ToastContentProps } from 'react-toastify'

import styles from './ToastAlert.module.scss'

export type AlertToastProps = Partial<ToastContentProps> & {
  type: AlertType
  title?: string
  message: string
  duration?: number
  closeable?: boolean
  typographyVariant?: variantType
  progressBar?: boolean
}

export const ToastAlert = ({
  type,
  title,
  message,
  closeToast,
  duration = 4000,
  closeable = true,
  typographyVariant = 'regular_16',
  progressBar = true,
}: AlertToastProps) => {
  const progress = useProgressBar(duration, progressBar)

  return (
    <Alert
      className={styles.root}
      type={type}
      title={title}
      message={message}
      typographyVariant={typographyVariant}
      duration={duration}
      closeable={closeable}
      onClose={closeToast}
      progressBar={progressBar}
      progress={progress}
    />
  )
}
