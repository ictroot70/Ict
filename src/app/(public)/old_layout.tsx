import { ReactElement } from 'react'

//import { GuestGuard } from '@/shared/guards'

import styles from './PublicLayout.module.scss'

export default function PublicLayout({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className={styles.wrapper}>
      {children}
      {/* <GuestGuard>{children}</GuestGuard> */}
    </div>
  )
}
