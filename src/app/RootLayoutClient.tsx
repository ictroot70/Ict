'use client'

import { ReactNode } from 'react'

import s from './RootLayoutClient.module.scss'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Sidebar } from '@/widgets/Sidebar'
import { Loading } from '@/shared/composites'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Loading />

  return (
    <main className={s.main}>
      <div className={s.wrapper}>
        {isAuthenticated && <Sidebar />}
        <div
          className={`${s.content} ${isAuthenticated ? s['content--withSidebar'] : s['content--withoutSidebar']}`}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
