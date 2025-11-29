'use client'

import { ReactNode } from 'react'

import s from './RootLayoutClient.module.scss'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Sidebar } from '@/widgets/Sidebar'
import { Loading } from '@/shared/composites'
import CreatePost from '@/features/posts/ui/CreatePostForm'
import { useCreatePostModal } from '@/features/posts/hooks/useCreatePostModal'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOpen, close, handlePublish } = useCreatePostModal()

  const isCreatePostOpen = isAuthenticated && isOpen
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
      {isCreatePostOpen && (
        <CreatePost open onClose={close} onPublishPost={handlePublish} />
      )}
    </main>
  )
}
