'use client'

import { ReactNode, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import s from './RootLayoutClient.module.scss'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Sidebar } from '@/widgets/Sidebar'
import { Loading } from '@/shared/composites'
import CreatePost from '@/features/posts/ui/CreatePostForm'
import type { PostViewModel } from '@/shared/types'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const action = useMemo(() => searchParams.get('action'), [searchParams])
  const isCreatePostOpen = isAuthenticated && action === 'create'

  const closeCreateModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('action')
    const queryString = params.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  const handlePublishPost = useCallback(
    (_post: PostViewModel) => {
      closeCreateModal()
    },
    [closeCreateModal]
  )

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
        <CreatePost open onClose={closeCreateModal} onPublishPost={handlePublishPost} />
      )}
    </main>
  )
}
