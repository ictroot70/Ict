import { useState } from 'react'
import { useDeletePostMutation } from '@/entities/posts/api/postApi'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/shared/constant'

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
    console.log(`Открывается модалка удаления для поста с ID: ${postId}`)
    setSelectedPostId(postId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPostId || !profileId) {
      console.error('Post ID or User ID not found')
      return
    }

    console.log(`Удаляется пост с ID: ${selectedPostId}`)

    try {
      setIsDeleting(true)

      const postIdNumber = parseInt(selectedPostId)
      await deletePost({
        postId: postIdNumber,
        userId: Number(profileId),
      }).unwrap()

      console.log(`Пост с ID: ${selectedPostId} успешно удален`)
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
    console.log('Удаление отменено')
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
