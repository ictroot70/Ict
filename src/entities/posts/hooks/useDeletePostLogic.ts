import { useState } from 'react'

import { useDeletePostMutation } from '@/entities/posts/api/postApi'

type DeletePostLogicOptions = {
  enabled?: boolean
  onDeleted?: (postId: number) => void
}

export const useDeletePostLogic = (userId: number, options?: DeletePostLogicOptions) => {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const handleDeletePost = (postId: string) => {
    if (options?.enabled === false) {
      return
    }
    setSelectedPostId(postId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPostId || !userId) {
      return
    }

    try {
      const postIdNumber = parseInt(selectedPostId)

      await deletePost({ postId: postIdNumber, userId }).unwrap()

      setIsDeleteModalOpen(false)
      setSelectedPostId(null)
      options?.onDeleted?.(postIdNumber)
    } catch (error) {
      console.error('Ошибка при удалении поста:', error)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setSelectedPostId(null)
  }

  return {
    isDeleteModalOpen,
    isDeleting,
    handleDeletePost,
    handleConfirmDelete,
    handleCancelDelete,
  }
}
