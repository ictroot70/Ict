import { useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { usePostModal } from '@/entities/posts/hooks'
import { postApi, PostViewModel, useGetPostByIdQuery } from '@/entities/posts/api'
import { Modal } from '@/shared/ui'
import { useAppDispatch } from '@/lib/hooks'

import s from './PostModal.module.scss'
import { EditMode } from './EditMode/EditMode'
import { ViewMode } from './ViewMode/ViewMode'
import { PostModalHandlers } from '@/shared/types'

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
                            isEditing = false,
                            postData: initialPostData,
                            postId
                          }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  // Получаем данные из кеша RTK Query
  const { data: dataFromCache, isLoading, isError } = useGetPostByIdQuery(
    postId || 0,
    { skip: !postId }
  )

  const needHydrateStateRef = useRef(!!initialPostData && !dataFromCache)

  // Гидрируем состояние если есть SSR данные но нет кеша
  useEffect(() => {
    if (needHydrateStateRef.current && initialPostData && postId) {
      needHydrateStateRef.current = false
      // Диспатчим данные в кеш
      dispatch(
        postApi.util.upsertQueryData('getPostById', postId, initialPostData)
      )
    }
  }, [dispatch, initialPostData, postId])

  // Используем кешированные данные или SSR данные
  const post = dataFromCache || initialPostData

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
    postData: modalPostData,
    variant,
    isAuthenticated,
    isOwnProfile,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
  } = usePostModal(open, post, postId)

  // Обработка закрытия модалки с очисткой URL
  const handleCloseModal = useCallback(() => {
    if (!isEditingDescription && !isEditing) {
      // Получаем текущие параметры
      const currentParams = new URLSearchParams(searchParams.toString())

      // Удаляем параметры связанные с постом
      currentParams.delete('postId')
      currentParams.delete('edit')

      router.back()

      // Вызываем коллбэк если есть
      onClose?.()
    }
  }, [router, searchParams, isEditingDescription, isEditing, onClose])

  // Обработка сохранения описания
  const handleSaveDescription = useCallback(({ description: newDescription }: { description: string }) => {
    const trimmed = newDescription.trim()

    if (trimmed && onEditPost && modalPostData.postId) {
      onEditPost(modalPostData.postId, trimmed)
      setIsEditingDescription(false)
    }
  }, [onEditPost, modalPostData.postId, setIsEditingDescription])

  // Обработка удаления поста
  const handleDeletePostAction = useCallback(() => {
    if (onDeletePost && modalPostData.postId) {
      onDeletePost(modalPostData.postId)

      // Закрываем модалку после удаления
      handleCloseModal()
    }
  }, [onDeletePost, modalPostData.postId, handleCloseModal])

  // Обработка Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingDescription && !isEditing) {
        handleCloseModal()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Блокируем скролл
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, isEditingDescription, isEditing, handleCloseModal])

  // Обработка клика вне модалки
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isEditingDescription && !isEditing) {
      handleCloseModal()
    }
  }, [isEditingDescription, isEditing, handleCloseModal])

  // Рендер контента
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={s.loading}>
          <div className={s.spinner}></div>
          <p>Загрузка поста...</p>
        </div>
      )
    }

    if (isError || !modalPostData) {
      return (
        <div className={s.error}>
          <p>Не удалось загрузить пост</p>
          <button
            onClick={handleCloseModal}
            className={s.closeButton}
          >
            Закрыть
          </button>
        </div>
      )
    }

    if (isEditingDescription) {
      return (
        <EditMode
          descriptionControl={descriptionControl}
          handleDescriptionSubmit={handleDescriptionSubmit}
          handleSaveDescription={handleSaveDescription}
          handleCancelEdit={handleCancelEdit}
          errors={errors}
          watchDescription={watchDescription}
          postData={modalPostData}
          onClose={handleCloseModal}
          isEditing={true}
        />
      )
    }

    return (
      <ViewMode
        onClose={handleCloseModal}
        postData={modalPostData}
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

  const showCloseBtnOutside = !isEditingDescription && !isEditing

  // Если модалка не открыта, не рендерим ничего
  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      className={s.modal}
    >
      {renderContent()}
    </Modal>
  )
}