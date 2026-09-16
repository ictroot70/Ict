import { ToastAlert } from '@/shared/composites/ToastAlert/ToastAlert'
import { toast } from 'react-toastify/unstyled'

import styles from './Toast.module.scss'

type ToastParams = {
  containerId?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  closeable?: boolean
  progressBar?: boolean
  typographyVariant?: string
}

export const showToastAlert = ({
  message,
  type = 'info',
  duration = 3000,
  closeable = true,
  containerId,
  progressBar = true,
  typographyVariant = 'regular_16',
}: ToastParams) => {
  toast(
    <ToastAlert
      typographyVariant={typographyVariant}
      type={type}
      message={message}
      duration={duration}
      progressBar={progressBar}
      closeable={closeable}
    />,
    {
      containerId,
      autoClose: duration,
      closeButton: false,
      className: styles.Toastify__toast,
    }
  )
}
