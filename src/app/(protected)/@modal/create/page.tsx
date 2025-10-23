'use client'

import { useRouter } from 'next/navigation'
import CreatePost from '@/features/posts/ui/CreatePostForm'

export default function CreatePostModal() {
  const router = useRouter()

  const handleClose = () => router.back()

  return (
    <CreatePost
      open={true}
      onClose={handleClose}
      onPublishPost={() => router.back()}
    />
  )
}