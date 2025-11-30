'use client'

import CreatePost from '@/features/posts/ui/CreatePostForm'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()

  return (
    <CreatePost
      open
      onClose={() => router.push('/feed')}
      onPublishPost={() => router.push('/feed')}
    />
  )
}
