'use client'
import { PropsWithChildren, ReactElement } from 'react'
import styles from './UsersLayout.module.scss'
import { ScrollAreaRadix } from '@/shared/ui'

export default function UsersLayout(props: PropsWithChildren): ReactElement {
  const { children } = props
  return (
    <div className={styles.wrapper}>
      <ScrollAreaRadix>{children}</ScrollAreaRadix>
    </div>
  )
}
