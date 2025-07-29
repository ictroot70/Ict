import { PropsWithChildren, ReactElement } from 'react'
import styles from './AuthLayout.module.scss'

export default function AuthLayout(props: PropsWithChildren): ReactElement {
  const { children } = props
  return <div className={styles.wrapper}>{children}</div>
}
