'use client'

import { ReactNode } from 'react'

import styles from './RootLayoutClient.module.scss'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Sidebar } from '@/widgets/Sidebar'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        {isAuthenticated && <Sidebar />}
        <div
          className={`${styles.content} ${isAuthenticated ? styles.withSidebar : styles.withoutSidebar}`}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
