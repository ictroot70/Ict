import { PropsWithChildren, ReactElement } from 'react'
import styles from './AuthLayout.module.scss'
import { ScrollAreaRadix } from '@/shared/ui'

export default function AuthLayout(props: PropsWithChildren): ReactElement {
  const { children } = props
  return <div className={styles.wrapper}>{children}</div>
}
