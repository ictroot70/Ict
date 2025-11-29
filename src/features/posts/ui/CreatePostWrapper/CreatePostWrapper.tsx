'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'
import { useCreatePostModal } from '@/features/posts/hooks/useCreatePostModal'
import CreatePost from '@/features/posts/ui/CreatePostForm'

export default function CreatePostWrapper(): ReactElement | null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isOpen, close, handlePublish } = useCreatePostModal(pathname, searchParams, router)
  if (!isOpen) return null
  return <CreatePost open onClose={close} onPublishPost={handlePublish} />
}
