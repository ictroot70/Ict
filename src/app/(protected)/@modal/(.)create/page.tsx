'use client'

import CreatePost from '@/features/posts/ui/CreatePostForm'
import { useRouter } from 'next/navigation'

export default function CreatePostModal() {
  const router = useRouter()

  const handleClose = () => router.back()

  return <CreatePost open onClose={handleClose} onPublishPost={() => router.back()} />
}
