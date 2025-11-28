import { useState } from 'react'
import { useUpdatePostMutation } from '@/entities/posts/api/postApi'

export const useEditPostLogic = (
  profileId: number | string | undefined,
  onRefetchPosts?: () => void
) => {
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const handleEditPost = async (postId: string, newDescription: string) => {
    console.log(`Редактируется пост с ID: ${postId}`)

    if (!profileId) {
      console.error('User ID not found')
      return
    }

    const updateData = {
      description: newDescription,
    }

    try {
      setEditingPostId(postId)

      await updatePost({
        postId: parseInt(postId),
        body: updateData,
        userId: Number(profileId),
      }).unwrap()

      onRefetchPosts?.()
      console.log(`Пост с ID: ${postId} успешно обновлен`)
      setEditingPostId(null)
    } catch (error) {
      console.error('Ошибка при редактировании поста:', error)
      setEditingPostId(null)
    }
  }

  return {
    editingPostId,
    handleEditPost,
  }
}
