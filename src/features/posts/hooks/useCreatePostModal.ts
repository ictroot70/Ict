'use client'

import type { PostViewModel } from '@/shared/types'

import { useCallback, useEffect, useState } from 'react'

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

const LOCATION_SEARCH_CHANGE_EVENT = 'app:location-search-change'

export const useCreatePostModal = (
  pathname: string,
  searchParams: SearchParamsLike,
  router: RouterLike
) => {
  const { user } = useAuth()
  const [action, setAction] = useState<null | string>(() => searchParams.get('action'))

  const isOpen = action === 'create'

  useEffect(() => {
    setAction(searchParams.get('action'))
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleLocationSearchChange = () => {
      const nextAction = new URLSearchParams(window.location.search).get('action')

      setAction(prev => (prev === nextAction ? prev : nextAction))
    }

    window.addEventListener('popstate', handleLocationSearchChange)
    window.addEventListener(LOCATION_SEARCH_CHANGE_EVENT, handleLocationSearchChange)

    return () => {
      window.removeEventListener('popstate', handleLocationSearchChange)
      window.removeEventListener(LOCATION_SEARCH_CHANGE_EVENT, handleLocationSearchChange)
    }
  }, [])

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    params.delete('action')
    const queryString = params.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname

    if (typeof window !== 'undefined') {
      window.history.replaceState(window.history.state, '', nextUrl)
      window.dispatchEvent(new Event(LOCATION_SEARCH_CHANGE_EVENT))

      return
    }

    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  const handlePublish = useCallback(
    (_post: PostViewModel) => {
      close()

      if (user?.userId) {
        const profileUrl = APP_ROUTES.PROFILE.ID(user.userId)

        if (pathname !== profileUrl) {
          router.replace(profileUrl)
        }
      }
    },
    [close, pathname, router, user]
  )

  return {
    isOpen,
    close,
    handlePublish,
  }
}
