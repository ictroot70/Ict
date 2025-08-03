'use client'
import { PropsWithChildren, ReactElement } from 'react'

import { ScrollAreaRadix } from '@/shared/ui'

import styles from './UsersLayout.module.scss'

export default function UsersLayout(props: PropsWithChildren): ReactElement {
  const { children } = props

  return (
    <div className={styles.wrapper}>
      <ScrollAreaRadix>{children}</ScrollAreaRadix>
    </div>
  )
}
