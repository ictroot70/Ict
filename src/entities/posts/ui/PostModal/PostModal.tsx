'use client'

import { ReactElement, useCallback, useEffect, useState } from 'react'

import { PostViewModel } from '@/entities/posts/api'
import { usePostModal } from '@/entities/posts/hooks'
import { PostModalHandlers } from '@/shared/types'
import { Close, Modal, Typography } from '@/shared/ui'

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
  const [isClientMounted, setIsClientMounted] = useState(false)
  const [showSsrFallback, setShowSsrFallback] = useState(open)
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
    isAuthLoading,
    isAuthenticated,
    isOwnProfile,
    hasPostData,
    isPostLoading,
    isPostError,
    uiText,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
    handleCopyLink,
    applyLocalDescription,
  } = usePostModal(open, initialPostData, postId)

  const handleSaveDescription = async ({
    description: newDescription,
  }: {
    description: string
  }) => {
    const trimmed = newDescription.trim()

    if (trimmed && onEditPost && postData.postId) {
      const updated = await onEditPost(postData.postId, trimmed)

      if (updated === false) {
        return
      }

      applyLocalDescription(trimmed)
      setIsEditingDescription(false)
    }
  }

  const handleDeletePostAction = () => {
    if (onDeletePost && postData.postId) {
      onDeletePost(postData.postId)
    }
  }

  const handleCloseModal = useCallback(() => {
    if (!isEditingDescription && !isEditing) {
      onClose()
    }
  }, [isEditingDescription, isEditing, onClose])

  useEffect(() => {
    setIsClientMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setShowSsrFallback(false)

      return
    }

    if (!isClientMounted) {
      setShowSsrFallback(true)

      return
    }

    setShowSsrFallback(true)

    let rafId1 = 0
    let rafId2 = 0

    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        setShowSsrFallback(false)
      })
    })

    return () => {
      cancelAnimationFrame(rafId1)
      cancelAnimationFrame(rafId2)
    }
  }, [open, isClientMounted])

  const showCloseBtnOutside = !isEditingDescription && !isEditing

  if (!open) {
    return <></>
  }

  const content = renderContent()

  return showCloseBtnOutside ? (
    <>
      {showSsrFallback && (
        <div className={s.fallbackOverlay} aria-hidden>
          <div className={s.fallbackDialog}>
            <span className={s.fallbackCloseButton}>
              <Close svgProps={{ width: 24, height: 24 }} />
            </span>
            {content}
          </div>
        </div>
      )}
      {isClientMounted && (
        <Modal open={open} onClose={handleCloseModal} closeBtnOutside className={s.modal}>
          {content}
        </Modal>
      )}
    </>
  ) : (
    <>
      {showSsrFallback && (
        <div className={s.fallbackOverlay} aria-hidden>
          <div className={s.fallbackDialog}>{content}</div>
        </div>
      )}
      {isClientMounted && (
        <Modal open={open} onClose={handleCloseModal} className={s.modal}>
          {content}
        </Modal>
      )}
    </>
  )

  function renderContent() {
    if (isPostLoading) {
      return (
        <div className={s.stateContainer}>
          <Typography variant={'h1'}>{uiText.loadingPost}</Typography>
        </div>
      )
    }

    if (!hasPostData) {
      return (
        <div className={s.stateContainer}>
          <Typography variant={'h1'}>
            {isPostError ? uiText.notFoundPost : uiText.unavailablePost}
          </Typography>
        </div>
      )
    }

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
        onCopyLink={handleCopyLink}
        formattedCreatedAt={formattedCreatedAt}
        isAuthLoading={isAuthLoading}
        isAuthenticated={isAuthenticated}
        isOwnProfile={isOwnProfile}
      />
    )
  }
}
