'use client'

import { useCallback } from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'

const copyText = async (text: string) => {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable')
  }

  await navigator.clipboard.writeText(text)
}

export const useFeedActions = () => {
  const copyPostLink = useCallback(async (ownerId: number, postId: number) => {
    const path = APP_ROUTES.PROFILE.WITH_POST(ownerId, postId)
    const url = new URL(path, window.location.origin).toString()

    try {
      await copyText(url)
      showToastAlert({ message: 'Link copied', type: 'success' })
    } catch {
      showToastAlert({ message: 'Failed to copy link', type: 'error' })
    }
  }, [])

  return { copyPostLink }
}
