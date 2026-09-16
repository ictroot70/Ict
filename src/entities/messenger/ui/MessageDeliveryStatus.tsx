import { MessageStatus } from '@/entities/messenger/model'
import { Checkmark, DoneAll } from '@ictroot/ui-kit/icons'
import { clsx } from 'clsx'

import styles from './MessageDeliveryStatus.module.scss'

const statusLabels: Record<MessageStatus, string> = {
  [MessageStatus.SENT]: 'Sent',
  [MessageStatus.RECEIVED]: 'Delivered',
  [MessageStatus.READ]: 'Read',
}

const statusClassNames: Record<MessageStatus, string> = {
  [MessageStatus.SENT]: styles.sent,
  [MessageStatus.RECEIVED]: styles.received,
  [MessageStatus.READ]: styles.read,
}

interface MessageDeliveryStatusProps {
  status: MessageStatus
  className?: string
}

export function MessageDeliveryStatus({ status, className }: MessageDeliveryStatusProps) {
  const label = statusLabels[status]

  return (
    <span
      aria-label={label}
      className={clsx(styles.status, statusClassNames[status], className)}
      title={label}
    >
      {status === MessageStatus.SENT ? <Checkmark /> : <DoneAll />}
    </span>
  )
}
