'use client'

import type { PostViewModel } from '@/shared/types'

import { useCallback, useMemo } from 'react'

import { useAuth } from '@/features/posts/utils/useAuth'
import { APP_ROUTES } from '@/shared/constant'

type SearchParamsLike = {
  get: (name: string) => null | string
  toString: () => string
}

type RouterLike = {
  push: (url: string) => void
  replace: (url: string, options?: { scroll?: boolean }) => void
}

export const useCreatePostModal = (
  pathname: string,
  searchParams: SearchParamsLike,
  router: RouterLike
) => {
  const { user } = useAuth()

  const action = useMemo(() => searchParams.get('action'), [searchParams])
  const isOpen = action === 'create'

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    params.delete('action')
    const queryString = params.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  const handlePublish = useCallback(
    (_post: PostViewModel) => {
      if (user?.userId) {
        router.push(APP_ROUTES.PROFILE.ID(user.userId))
      } else {
        close()
      }
    },
    [user, router, close]
  )

  return {
    isOpen,
    close,
    handlePublish,
  }
}
