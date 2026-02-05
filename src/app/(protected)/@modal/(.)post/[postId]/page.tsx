import { PostViewModel } from '@/entities/posts/api'
import { PostModal } from '@/entities/posts/ui/PostModal/PostModal'

export default async function InterceptedPostModalPage({ 
  searchParams
}: { 
  searchParams: Promise<{ postId: string }>
}) {
  const { postId } = await searchParams
  
  // Получаем данные поста на сервере для SSR
  const response = await fetch(`https://ictroot.uk/api/v1/posts/id/${postId}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch post')
  }
  
  const postData = await response.json() as PostViewModel

  return (
    <PostModal
      open={true}
      postData={postData}
      postId={Number(postId)}
      onClose={() => {
        // Будет переопределено в клиентском компоненте
      }}
    />
  )
}