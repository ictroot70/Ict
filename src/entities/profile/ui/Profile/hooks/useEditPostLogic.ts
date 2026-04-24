import { useState } from 'react'

import { useUpdatePostMutation } from '@/entities/posts/api/postApi'

export const useEditPostLogic = (
  profileId: number | string | undefined,
  onRefetchPosts?: () => void
) => {
  const [updatePost] = useUpdatePostMutation()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const handleEditPost = async (postId: string, newDescription: string) => {
    if (!profileId) {
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
