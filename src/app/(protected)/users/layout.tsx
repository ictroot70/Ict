'use client'
import { PropsWithChildren, ReactElement } from 'react'

import { ScrollAreaRadix } from '@/shared/ui'

import styles from './UsersLayout.module.scss'
import { Sidebar } from '@/widgets/Sidebar'

export default function UsersLayout(props: PropsWithChildren): ReactElement {
  const { children } = props

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.content}>
        <ScrollAreaRadix>{children}</ScrollAreaRadix>
      </div>
    </div>
  )
}
