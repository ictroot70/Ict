'use client'

import type { PostViewModel } from '@/shared/types'

import { useCallback } from 'react'

import { useAuth } from '@/features/posts/utils/useAuth'
import { useModalQuery } from '@/shared/hooks/useModalQuery'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'

export const useCreatePostModal = () => {
  const { user } = useAuth()
  const router = useRouter()
  const modal = useModalQuery('action', 'create')

  const handlePublish = useCallback(
    (_post: PostViewModel) => {
      if (user?.userId) {
        modal.close()
        router.push(APP_ROUTES.PROFILE.ID(user.userId))
      } else {
        modal.close()
      }
    },
    [user, router, modal]
  )

  return {
    isOpen: modal.isOpen,
    close: modal.close,
    open: modal.open,
    handlePublish,
  }
}
