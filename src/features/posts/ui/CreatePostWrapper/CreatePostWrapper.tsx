'use client'

import { ReactElement } from 'react'

import { useCreatePostModal } from '@/features/posts/hooks/useCreatePostModal'
import CreatePost from '@/features/posts/ui/CreatePostForm'

export default function CreatePostWrapper(): ReactElement | null {
  const { isOpen, close, handlePublish } = useCreatePostModal()

  if (!isOpen) {
    return null
  }

  return <CreatePost open onClose={close} onPublishPost={handlePublish} />
}
