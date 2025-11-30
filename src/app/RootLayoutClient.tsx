'use client'

import { ReactNode } from 'react'

import CreatePostWrapper from '@/features/posts/ui/CreatePostWrapper/CreatePostWrapper'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Loading } from '@/shared/composites'
import { Sidebar } from '@/widgets/Sidebar'

import s from './RootLayoutClient.module.scss'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  const isCreatePostOpen = isAuthenticated

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
      {isCreatePostOpen && <CreatePostWrapper />}
    </main>
  )
}
