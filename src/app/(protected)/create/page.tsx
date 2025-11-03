'use client'

import { useRouter } from 'next/navigation'
import CreatePost from '@/features/posts/ui/CreatePostForm'

export default function CreatePage() {
  const router = useRouter()

  return (
    <CreatePost
      open={true}
      onClose={() => router.push('/feed')}
      onPublishPost={() => router.push('/feed')}
    />
  )
}
