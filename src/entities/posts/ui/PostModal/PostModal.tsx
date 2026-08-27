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
  const { actions, auth, comments, description, follow, post, uiText } = usePostModal(
    open,
    initialPostData,
    postId,
    authState
  )
  const postData = post.data
  const isEditingDescription = description.isEditing

  const handleSaveDescription = async ({
    description: newDescription,
  }: {
    description: string
  }) => {
    const trimmed = newDescription.trim()

    if (trimmed && onEditPost && postData?.id) {
      const updated = await onEditPost(postData.id, trimmed)

      if (!updated) {
        return
      }

      description.applyLocal(trimmed)
      description.setIsEditing(false)
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
    if (post.isLoading) {
      return (
        <div className={s.stateContainer}>
          <Typography variant={'h1'}>{uiText.loadingPost}</Typography>
        </div>
      )
    }

    if (!post.hasData || !postData) {
      return (
        <div className={s.stateContainer}>
          <Typography variant={'h1'}>
            {post.isError ? uiText.notFoundPost : uiText.unavailablePost}
          </Typography>
        </div>
      )
    }

    return isEditingDescription ? (
      <EditMode
        description={description}
        handleSaveDescription={handleSaveDescription}
        postData={postData}
        isEditing
      />
    ) : (
      <ViewMode
        actions={actions}
        auth={auth}
        comments={comments}
        description={description}
        follow={follow}
        handleDeletePost={handleDeletePostAction}
        post={post}
        postData={postData}
        renderPostLikeAction={renderPostLikeAction}
      />
    )
  }
}
