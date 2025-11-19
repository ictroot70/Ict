
'use client'

import { ReactElement, useEffect } from 'react'
import { Modal } from '@/shared/ui'
import s from './PostModal.module.scss'
import { EditMode } from './EditMode/EditMode'
import { ViewMode } from './ViewMode/ViewMode'
import { PostModalHandlers } from '@/shared/types'
import { usePostModal } from '@/entities/posts/hooks'

interface Props extends PostModalHandlers {
  open: boolean
  isEditing?: boolean
}

export const PostModal = ({
  open,
  onClose,
  onEditPost,
  onDeletePost,
  isEditing
}: Props): ReactElement => {
  const {
    comments,
    isEditingDescription,
    setIsEditingDescription,
    commentControl,
    handleCommentSubmit,
    watchComment,
    descriptionControl,
    handleDescriptionSubmit,
    watchDescription,
    errors,
    postData,
    variant,
    isAuthenticated,
    isOwnProfile,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
  } = usePostModal(open)

  const handleSaveDescription = ({ description: newDescription }: { description: string }) => {
    const trimmed = newDescription.trim()
    if (trimmed && onEditPost && postData.postId) {
      onEditPost(postData.postId, trimmed)
      setIsEditingDescription(false)
    }
  }

  const handleDeletePostAction = () => {
    if (onDeletePost && postData.postId) {
      onDeletePost(postData.postId)
    }
  }

  // Функция для закрытия модалки с проверкой на редактирование
  const handleCloseModal = () => {
    if (!isEditingDescription && !isEditing) {
      onClose()
    }
  }

  // Обработка Escape - не закрываем при редактировании
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingDescription && !isEditing) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose, isEditingDescription, isEditing])

  // Определяем, показывать ли кнопку закрытия снаружи
  const showCloseBtnOutside = !isEditingDescription && !isEditing

  return (
    <>
      {showCloseBtnOutside ? (
        // Вариант с кнопкой закрытия снаружи
        <Modal
          open={open}
          onClose={handleCloseModal}
          closeBtnOutside={true}
          className={s.modal}
        >
          <div className={s.innerModal}>
            {renderContent()}
          </div>
        </Modal>
      ) : (
        // Вариант без кнопки закрытия снаружи
        <Modal
          open={open}
          onClose={handleCloseModal}
          className={s.modal}

        >
          <div className={s.innerModal}>
            {renderContent()}
          </div>
        </Modal>
      )}
    </>
  )

  function renderContent() {
    return isEditingDescription ? (
      <EditMode
        descriptionControl={descriptionControl}
        handleDescriptionSubmit={handleDescriptionSubmit}
        handleSaveDescription={handleSaveDescription}
        handleCancelEdit={handleCancelEdit}
        errors={errors}
        watchDescription={watchDescription}
        postData={postData}
        onClose={handleCloseModal}
        isEditing={true}
      />
    ) : (
      <ViewMode
        onClose={handleCloseModal}
        postData={postData}
        variant={variant}
        handleEditPost={handleEditPost}
        handleDeletePost={handleDeletePostAction}
        isEditing={isEditing}
        comments={comments}
        commentControl={commentControl}
        handleCommentSubmit={handleCommentSubmit}
        watchComment={watchComment}
        handlePublish={handlePublish}
        formattedCreatedAt={formattedCreatedAt}
        isAuthenticated={isAuthenticated}
        isOwnProfile={isOwnProfile}
      />
    )
  }
}

export default PostModal