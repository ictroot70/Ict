'use client'

import { ReactElement, useCallback, useLayoutEffect, useState } from 'react'

import { PostViewModel } from '@/entities/posts/api'
import { usePostModal } from '@/entities/posts/hooks'
import { PostModalHandlers } from '@/shared/types'
import { Close, Modal, Typography } from '@/shared/ui'

import s from './PostModal.module.scss'

import { EditMode } from './EditMode/EditMode'
import { ViewMode } from './ViewMode/ViewMode'
import { PostModalAuthState, RenderPostLikeAction } from './postModalLikeAction.types'

interface Props extends PostModalHandlers {
  open: boolean
  isEditing?: boolean
  postData?: PostViewModel
  postId?: number
  authState?: PostModalAuthState
  renderPostLikeAction?: RenderPostLikeAction
}

export const PostModal = ({
  open,
  onClose,
  onEditPost,
  onDeletePost,
  isEditing,
  postData: initialPostData,
  postId,
  authState,
  renderPostLikeAction,
}: Props): ReactElement => {
  const [isClientMounted, setIsClientMounted] = useState(false)
  const {
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
    isCreateCommentLoading,
    commentMaxLength,
    isAuthenticated,
    hasPostData,
    isPostLoading,
    isPostError,
    uiText,
    formattedCreatedAt,
    handlePublish,
    handleEditPost,
    handleCancelEdit,
    handleCopyLink,
    handleFollow,
    isFollowing,
    isFollowPending,
    applyLocalDescription,
    currentUserName,
    currentUserAvatar,
  } = usePostModal(open, initialPostData, postId, authState)

  const handleSaveDescription = async ({
    description: newDescription,
  }: {
    description: string
  }) => {
    const trimmed = newDescription.trim()

    if (!postData) {
      return
    }

    if (onEditPost && postData.postId) {
      const updated = await onEditPost(postData.postId, trimmed)

      if (!updated) {
        return
      }

      applyLocalDescription(trimmed)
      setIsEditingDescription(false)
    }
  }

  const handleDeletePostAction = () => {
    if (onDeletePost && postData?.id) {
      onDeletePost(postData.id)
    }
  }

  const handleCloseModal = useCallback(() => {
    if (!isEditingDescription && !isEditing) {
      onClose()
    }
  }, [isEditingDescription, isEditing, onClose])

  useLayoutEffect(() => {
    setIsClientMounted(true)
  }, [])

  const showCloseBtnOutside = !isEditingDescription && !isEditing

  if (!open) {
    return <></>
  }

  const content = renderContent()

  if (!isClientMounted) {
    return (
      <div className={s.fallbackOverlay} aria-hidden>
        <div className={s.fallbackDialog}>
          {showCloseBtnOutside && (
            <span className={s.fallbackCloseButton}>
              <Close svgProps={{ width: 24, height: 24 }} />
            </span>
          )}
          {content}
        </div>
      </div>
    )
  }

  return showCloseBtnOutside ? (
    <Modal open={open} onClose={handleCloseModal} closeBtnOutside className={s.modal}>
      {content}
    </Modal>
  ) : (
    <Modal open={open} onClose={handleCloseModal} className={s.modal}>
      {content}
    </Modal>
  )

  function renderContent() {
    if (isPostLoading) {
      return (
        <div className={s.stateContainer}>
          <Typography variant={'h1'}>{uiText.loadingPost}</Typography>
        </div>
      )
    }

    if (!hasPostData || !postData) {
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
        postData={postData}
        variant={variant}
        handleEditPost={handleEditPost}
        handleDeletePost={handleDeletePostAction}
        onCopyLink={handleCopyLink}
        onFollow={handleFollow}
        isFollowing={isFollowing}
        isFollowPending={isFollowPending}
        formattedCreatedAt={formattedCreatedAt}
        isAuthLoading={isAuthLoading}
        isCreateCommentLoading={isCreateCommentLoading}
        commentMaxLength={commentMaxLength}
        isAuthenticated={isAuthenticated}
        commentsEnabled={open && hasPostData}
        commentControl={commentControl}
        handleCommentSubmit={handleCommentSubmit}
        watchComment={watchComment}
        handlePublish={handlePublish}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        renderPostLikeAction={renderPostLikeAction}
      />
    )
  }
}
