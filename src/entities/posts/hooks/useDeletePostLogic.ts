import { useState } from 'react'

import { useDeletePostMutation } from '@/entities/posts/api/postApi'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'

export const useDeletePostLogic = (
  userId: number,
  options?: { enabled?: boolean }
) => {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const router = useRouter()

  const handleDeletePost = (postId: string) => {
    if (options?.enabled === false) return
    setSelectedPostId(postId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPostId || !userId) {
      return
    }

    try {
      const postIdNumber = parseInt(selectedPostId)

      await deletePost({ postId: postIdNumber }).unwrap()

      setIsDeleteModalOpen(false)
      setSelectedPostId(null)
      router.replace(APP_ROUTES.PROFILE.ID(userId))
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
