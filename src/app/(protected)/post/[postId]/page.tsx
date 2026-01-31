import { PostModal } from '@/entities/profile/ui/PostModal/PostModal'
import { PostViewModel } from '@/entities/posts/api'

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  
  // Получаем данные поста на сервере
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