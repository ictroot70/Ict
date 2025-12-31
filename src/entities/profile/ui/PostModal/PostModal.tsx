'use client'

import { ReactElement, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { usePostModal } from '@/entities/posts/hooks'
import { postApi, useGetPostByIdQuery } from '@/entities/posts/api'
import { PostModalHandlers } from '@/shared/types'
import { PostViewModel } from '@/shared/types'
import { Modal } from '@/shared/ui'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import s from './PostModal.module.scss'

import { EditMode } from './EditMode/EditMode'
import { ViewMode } from './ViewMode/ViewMode'

interface Props extends PostModalHandlers {
  open: boolean
  isEditing?: boolean
  postData?: PostViewModel
  postId?: number
}

export const PostModal = ({
  open,
  onClose,
  onEditPost,
  onDeletePost,
  isEditing,
  postData: initialPostData,
  postId,
}: Props): ReactElement => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Получаем данные из кеша RTK Query
  const dataFromCache = useAppSelector((state) =>
    postId ? postApi.endpoints.getPostById.select(postId)(state).data : undefined
  )

  const needHydrateStateRef = useRef(!!initialPostData && !dataFromCache)

  // Гидрируем состояние если есть SSR данные но нет кеша
  useEffect(() => {
    if (needHydrateStateRef.current && initialPostData && postId) {
      needHydrateStateRef.current = false
      // const thunk = postApi.util.upsertQueryData('getPostById', postId, initialPostData)
      dispatch(useGetPostByIdQuery(postId))
    }
  }, [dispatch, initialPostData, postId])

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
  } = usePostModal(open, dataFromCache || initialPostData, postId)

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

  const handleCloseModal = () => {
    if (!isEditingDescription && !isEditing) {
      // Закрываем модалку через роутер (убираем postId из URL)
      router.back()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingDescription && !isEditing) {
        handleCloseModal()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, isEditingDescription, isEditing])

  const showCloseBtnOutside = !isEditingDescription && !isEditing

  return (
    <>
      {showCloseBtnOutside ? (
        <Modal open={open} onClose={handleCloseModal} closeBtnOutside className={s.modal}>
          {renderContent()}
        </Modal>
      ) : (
        <Modal open={open} onClose={handleCloseModal} className={s.modal}>
          {renderContent()}
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
        isEditing
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
