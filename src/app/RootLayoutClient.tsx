'use client'

import { ReactNode } from 'react'

import { useAuth } from '@/features/posts/utils/useAuth'
import { Loading } from '@/shared/composites'
import { ModalWrapper } from '@/shared/composites/ModalWrapper/ModalWrapper'
import { Sidebar } from '@/widgets/Sidebar'

import s from './RootLayoutClient.module.scss'

export const RootLayoutClient = ({ children,  }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

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
      <ModalWrapper />
    </main>
  )
}
