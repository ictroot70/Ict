import { PropsWithChildren, ReactElement } from 'react'
import styles from './PublicLayout.module.scss'

export default function PublicLayout(props: PropsWithChildren): ReactElement {
  const { children } = props
  return <div className={styles.wrapper}>{children}</div>
}
