'use client'

import { ReactNode } from 'react'

import { useGoogleAuth } from '@/shared/lib/hooks/useGoogleAuth'

import styles from './RootLayoutClient.module.scss'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  useGoogleAuth()

  return <main className={styles.main}>{children}</main>
}
