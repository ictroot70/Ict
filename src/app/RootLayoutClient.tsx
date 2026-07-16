'use client'

import { lazy, ReactNode, Suspense, useEffect, useState } from 'react'

import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { ScrollAreaRadix } from '@/shared/ui'
import { SidebarSkeleton } from '@/widgets/Sidebar/components/SidebarSkeleton'

import s from './RootLayoutClient.module.scss'

type Props = {
  children: ReactNode
}

const Sidebar = lazy(() =>
  import('@/widgets/Sidebar').then(module => ({
    default: module.Sidebar,
  }))
)

const CreatePostWrapper = lazy(
  () => import('@/features/posts/ui/CreatePostWrapper/CreatePostWrapper')
)

export const RootLayoutClient = ({ children }: Props) => {
  const { status } = useAuthUiState()
  const showSidebar = status === 'authenticated'
  const showSidebarSkeleton = status === 'loading'
  const shouldReserveSidebarSpace = showSidebar || showSidebarSkeleton

  useEffect(() => {
    const root = document.documentElement

    root.setAttribute('data-layout-sidebar', shouldReserveSidebarSpace ? '1' : '0')

    return () => root.removeAttribute('data-layout-sidebar')
  }, [shouldReserveSidebarSpace])

  const isCreatePostOpen = status === 'authenticated'

  return (
    <main className={s.main}>
      <ScrollAreaRadix className={s.scrollArea} viewportClassName={s.scrollViewport}>
        <div className={s.wrapper}>
          {showSidebar && (
            <Suspense fallback={null}>
              <Sidebar />
            </Suspense>
          )}
          {showSidebarSkeleton && <SidebarSkeleton />}
          <div
            className={`${s.content} ${
              shouldReserveSidebarSpace ? s['content--withSidebar'] : s['content--withoutSidebar']
            }`}
          >
            {children}
          </div>
        </div>
      </ScrollAreaRadix>
      {isCreatePostOpen && (
        <Suspense fallback={null}>
          <CreatePostWrapper />
        </Suspense>
      )}
    </main>
  )
}
