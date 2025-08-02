import { GuestGuard } from '@/shared/guards'
import { ReactElement } from 'react'

import styles from './PublicLayout.module.scss'

export default function PublicLayout({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className={styles.wrapper}>
      <GuestGuard>{children}</GuestGuard>
    </div>
  )
}
