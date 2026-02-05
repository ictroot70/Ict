'use client'

import { ReactElement } from 'react'

import { useCreatePostModal } from '@/features/posts/hooks/useCreatePostModal'
import CreatePost from '@/features/posts/ui/CreatePostForm'
import { useModalQuery } from '@/shared/hooks/useModalQuery'
import { PostModal } from '@/entities/posts/ui/PostModal/PostModal'

/**
 * Универсальный компонент-обертка для всех модалок
 * Управляет открытием/закрытием модалок через query-параметры:
 * - action=create - для модалки создания поста
 * - postId=xxx - для модалки просмотра поста
 */
export const ModalWrapper = (): ReactElement | null => {
  // Управление модалкой создания поста
  const { isOpen: isCreatePostOpen, close: closeCreatePost, handlePublish } = useCreatePostModal()

  // Управление модалкой просмотра поста
  const postModal = useModalQuery('postId')
  const { isOpen: isPostModalOpen, close: closePostModal } = postModal

  // Если ни одна модалка не открыта, ничего не рендерим
  if (!isCreatePostOpen && !isPostModalOpen) {
    return null
  }

  return (
    <>
      {isCreatePostOpen && (
        <CreatePost open onClose={closeCreatePost} onPublishPost={handlePublish} />
      )}
      {isPostModalOpen && (
        <PostModal
          open={isPostModalOpen}
          onClose={closePostModal}
        />
      )}
    </>
  )
}

