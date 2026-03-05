'use client'

import { ReactNode, useEffect, useState } from 'react'

import CreatePostWrapper from '@/features/posts/ui/CreatePostWrapper/CreatePostWrapper'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { Sidebar, SidebarSkeleton } from '@/widgets/Sidebar'
import { useSearchParams } from 'next/navigation'

import s from './RootLayoutClient.module.scss'

type Props = {
  children: ReactNode
}

export const RootLayoutClient = ({ children }: Props) => {
  const { status } = useAuthUiState()
  const searchParams = useSearchParams()
  const showSidebar = status === 'authenticated'
  const showSidebarSkeleton = status === 'loading'
  const postIdParam = searchParams.get('postId')
  const parsedPostId = postIdParam ? Number(postIdParam) : NaN
  const isPostModalOpen = Number.isInteger(parsedPostId) && parsedPostId > 0
  const [shouldPreserveSidebarSpaceForModal, setShouldPreserveSidebarSpaceForModal] =
    useState(false)

  useEffect(() => {
    if (!isPostModalOpen) {
      setShouldPreserveSidebarSpaceForModal(false)

      return
    }

    if (showSidebar || showSidebarSkeleton) {
      setShouldPreserveSidebarSpaceForModal(true)
    }
  }, [isPostModalOpen, showSidebar, showSidebarSkeleton])

  const shouldReserveSidebarSpace =
    showSidebar || showSidebarSkeleton || (isPostModalOpen && shouldPreserveSidebarSpaceForModal)
  const shouldRenderSidebarSkeleton = showSidebarSkeleton && !isPostModalOpen

  const isCreatePostOpen = status === 'authenticated'

  return (
    <main className={s.main}>
      <div className={s.wrapper}>
        {showSidebar && <Sidebar />}
        {shouldRenderSidebarSkeleton && <SidebarSkeleton />}
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
