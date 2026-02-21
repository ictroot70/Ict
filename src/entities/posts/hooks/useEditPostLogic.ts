import { useState } from 'react'

import { useUpdatePostMutation } from '@/entities/posts/api/postApi'

export const useEditPostLogic = (
  userId: number,
  options?: { enabled?: boolean }
) => {
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const handleEditPost = async (postId: string, newDescription: string) => {
    if (options?.enabled === false) return

    const updateData = {
      description: newDescription,
    }

    try {
      setEditingPostId(postId)

      await updatePost({
        postId: parseInt(postId),
        body: updateData,
        userId: userId,
      }).unwrap()

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
