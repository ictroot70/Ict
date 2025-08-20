'use client'

import { ReactNode } from 'react'

import { useGoogleAuth } from '@/shared/lib/hooks/useGoogleAuth'

import styles from './RootLayoutClient.module.scss'
import { useGitHubAuth } from '@/shared/lib/hooks/useGitHubAuth'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  useGoogleAuth()
  useGitHubAuth()

  return <main className={styles.main}>{children}</main>
}
