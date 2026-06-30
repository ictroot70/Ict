import { useState } from 'react'

import { useUpdatePostMutation } from '@/entities/posts/api'

export const useEditPostLogic = (userId: number, options?: { enabled?: boolean }) => {
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<number | null>(null)

  const handleEditPost = async (postIdValue: number, newDescription: string) => {
    if (options?.enabled === false) {
      return false
    }

    const postId = String(postIdValue)
    const updateData = {
      description: newDescription,
    }

    try {
      setEditingPostId(postIdValue)

      await updatePost({
        postId: parseInt(postId),
        body: updateData,
        userId: userId,
      }).unwrap()

      setEditingPostId(null)

      return true
    } catch (error) {
      console.error('Ошибка при редактировании поста:', error)
      setEditingPostId(null)

      return false
    }
  }

  return {
    editingPostId,
    handleEditPost,
  }
}
