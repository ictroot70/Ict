'use client'

import { ReactNode } from 'react'

import CreatePostWrapper from '@/features/posts/ui/CreatePostWrapper/CreatePostWrapper'
import { useAuth } from '@/features/posts/utils/useAuth'
import { useEffectiveAuthHint } from '@/shared/auth'
import { Sidebar, SidebarSkeleton } from '@/widgets/Sidebar'

import s from './RootLayoutClient.module.scss'

type Props = {
  children: ReactNode
}

export const RootLayoutClient = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()
  const effectiveHasAuthHint = useEffectiveAuthHint()
  const isAuthResolvingForUi = effectiveHasAuthHint && !isAuthenticated && isLoading
  const showSidebar = isAuthenticated
  const showSidebarSkeleton = isAuthResolvingForUi
  const shouldReserveSidebarSpace = showSidebar || showSidebarSkeleton

  const isCreatePostOpen = isAuthenticated

  return (
    <main className={s.main}>
      <div className={s.wrapper}>
        {shouldReserveSidebarSpace && (showSidebar ? <Sidebar /> : <SidebarSkeleton />)}
        <div
          className={`${s.content} ${shouldReserveSidebarSpace ? s['content--withSidebar'] : s['content--withoutSidebar']}`}
        >
          {children}
        </div>
      </div>
      {isCreatePostOpen && <CreatePostWrapper />}
    </main>
  )
}
