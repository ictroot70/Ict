import { postApi, useGetPostByIdQuery } from '@/entities/posts/api'
import { PostModal } from '@/entities/posts/ui/PostModal/PostModal'

export default async function PostModalPage({
                                                    params,
                                                  }: {
  params: Promise<{ postId: string }>
}) {
  const { postId }  = await params;
  const post = await useGetPostByIdQuery(+postId); // SSR запрос

  return (
    <PostModal

      open={true}
      onClose={function (): void {
        throw new Error('Function not implemented.')
      }}
    />
  )
}