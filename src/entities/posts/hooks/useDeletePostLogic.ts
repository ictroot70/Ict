import { useState } from 'react'

import { useDeletePostMutation } from '@/entities/posts/api/postApi'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'

export const useDeletePostLogic = (
  profileId: number | string | undefined,
  onRefetchPosts?: () => void
) => {
  const [deletePost] = useDeletePostMutation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()

  const handleDeletePost = (postId: string) => {
    setSelectedPostId(postId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPostId || !profileId) {
      return
    }

    try {
      setIsDeleting(true)

      const postIdNumber = parseInt(selectedPostId)

      await deletePost({ postId: postIdNumber }).unwrap()

      setIsDeleteModalOpen(false)
      setSelectedPostId(null)
      onRefetchPosts?.()
      router.push(APP_ROUTES.PROFILE.ID(+profileId))
    } catch (error) {
      console.error('Ошибка при удалении поста:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setSelectedPostId(null)
  }

  return {
    isDeleteModalOpen,
    selectedPostId,
    isDeleting,
    handleDeletePost,
    handleConfirmDelete,
    handleCancelDelete,
  }
}
