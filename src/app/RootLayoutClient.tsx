'use client'

import { ReactNode } from 'react'

import styles from './RootLayoutClient.module.scss'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  return <main className={styles.main}>{children}</main>
}
