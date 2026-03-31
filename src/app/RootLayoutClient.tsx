'use client'

import { lazy, ReactNode, Suspense, useEffect, useState } from 'react'

import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { ScrollAreaRadix } from '@/shared/ui'
import { SidebarSkeleton } from '@/widgets/Sidebar/components/SidebarSkeleton'
import { useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const [isHydrated, setIsHydrated] = useState(false)
  const showSidebar = status === 'authenticated'
  const showSidebarSkeleton = status === 'loading'
  const postIdParam = searchParams.get('postId')
  const parsedPostId = postIdParam ? Number(postIdParam) : NaN
  const isPostModalOpen = Number.isInteger(parsedPostId) && parsedPostId > 0
  const [shouldPreserveSidebarSpaceForModal, setShouldPreserveSidebarSpaceForModal] =
    useState(false)
  const canRenderAuthSensitiveLayout = isHydrated
  const visibleSidebar = canRenderAuthSensitiveLayout && showSidebar
  const visibleSidebarSkeleton = canRenderAuthSensitiveLayout && showSidebarSkeleton

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isPostModalOpen) {
      setShouldPreserveSidebarSpaceForModal(false)

      return
    }

    if (visibleSidebar || visibleSidebarSkeleton) {
      setShouldPreserveSidebarSpaceForModal(true)
    }
  }, [isPostModalOpen, visibleSidebar, visibleSidebarSkeleton])

  const shouldReserveSidebarSpace =
    visibleSidebar ||
    visibleSidebarSkeleton ||
    (isPostModalOpen && shouldPreserveSidebarSpaceForModal)
  const shouldRenderSidebarSkeleton = visibleSidebarSkeleton && !isPostModalOpen

  useEffect(() => {
    const root = document.documentElement

    root.setAttribute('data-layout-sidebar', shouldReserveSidebarSpace ? '1' : '0')

    return () => {
      root.removeAttribute('data-layout-sidebar')
    }
  }, [shouldReserveSidebarSpace])

  const isCreatePostOpen = canRenderAuthSensitiveLayout && status === 'authenticated'

  return (
    <main className={s.main}>
      <ScrollAreaRadix className={s.scrollArea} viewportClassName={s.scrollViewport}>
        <div className={s.wrapper}>
          {visibleSidebar && (
            <Suspense fallback={null}>
              <Sidebar />
            </Suspense>
          )}
          {shouldRenderSidebarSkeleton && <SidebarSkeleton />}
          <div
            className={`${s.content} ${shouldReserveSidebarSpace ? s['content--withSidebar'] : s['content--withoutSidebar']}`}
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
