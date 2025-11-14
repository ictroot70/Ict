'use client'

import { ReactElement, useEffect, useState } from 'react'
import { Modal, } from '@/shared/ui'
import s from './PostModal.module.scss'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/posts/utils/useAuth'
import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import { EditMode } from './EditMode/EditMode'
import { ViewMode } from './ViewMode/ViewMode'
import { useForm } from 'react-hook-form'

type CommentForm = { comment: string }
type EditDescriptionForm = { description: string }

type Props = {
  open: boolean
  onClose: () => void
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
}

export const PostModal = ({
  open,
  onClose,
  onEditPost,
  onDeletePost,
  isEditing
}: Props): ReactElement => {
  const [comments, setComments] = useState<string[]>([])
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const { control: commentControl, handleSubmit: handleCommentSubmit, reset: resetComment, watch: watchComment } = useForm<CommentForm>({
    defaultValues: { comment: '' },
  })

  const { control: descriptionControl, handleSubmit: handleDescriptionSubmit, reset: resetDescription, watch: watchDescription, formState: { errors } } = useForm<EditDescriptionForm>({
    defaultValues: { description: '' },
    mode: 'onChange'
  })

  const searchParams = useSearchParams()
  const postIdFromQuery = searchParams.get('postId')
  const postId = postIdFromQuery ? Number(postIdFromQuery) : undefined

  const { data: postData } = useGetPostByIdQuery(postId as number, {
    skip: !open || !postId,
  })

  const { user, isAuthenticated } = useAuth()
  const computedVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
    ? 'public'
    : postData?.ownerId && user?.userId === postData.ownerId
      ? 'myPost'
      : 'userPost'

  const effectiveImages = postData?.images ?? []
  const effectiveUserName = postData?.userName ?? ''
  const effectiveAvatar = postData?.avatarOwner ?? ''
  const effectiveDescription = postData?.description ?? ''
  const effectiveCreatedAt = postData?.createdAt ?? new Date().toISOString()
  const effectivePostId = postData?.id ? String(postData.id) : ''

  useEffect(() => {
    resetDescription({ description: effectiveDescription })
  }, [effectiveDescription, resetDescription])

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    resetComment()
  }

  const handleSaveDescription = ({ description: newDescription }: EditDescriptionForm) => {
    const trimmed = newDescription.trim()
    if (trimmed && onEditPost && effectivePostId) {
      onEditPost(effectivePostId, trimmed)
      setIsEditingDescription(false)
    }
  }

  const handleCancelEdit = () => {
    resetDescription({ description: effectiveDescription })
    setIsEditingDescription(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingDescription) {
          return
        } else {
          onClose()
        }
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, isEditingDescription])

  const handleEditPost = () => {
    setIsEditingDescription(true)
  }

  const handleDeletePost = () => {
    console.log(`PostModal: вызываем удаление для поста ${effectivePostId}`)
    if (onDeletePost && effectivePostId) {
      onDeletePost(effectivePostId)
    }
  }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(effectiveCreatedAt))

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeBtnOutside={true}
      className={s.modal}
    >
      <div className={s.innerModal}>
        {isEditingDescription ? (
          <EditMode
            descriptionControl={descriptionControl}
            handleDescriptionSubmit={handleDescriptionSubmit}
            handleSaveDescription={handleSaveDescription}
            handleCancelEdit={handleCancelEdit}
            errors={errors}
            watchDescription={watchDescription}
            effectiveImages={effectiveImages}
            effectiveAvatar={effectiveAvatar}
            effectiveUserName={effectiveUserName}
            effectiveDescription={effectiveDescription}
            onClose={onClose}
          />
        ) : (
          <ViewMode
            onClose={onClose}
            effectiveImages={effectiveImages}
            effectiveAvatar={effectiveAvatar}
            effectiveUserName={effectiveUserName}
            effectiveDescription={effectiveDescription}
            effectivePostId={effectivePostId}
            effectiveCreatedAt={effectiveCreatedAt}
            computedVariant={computedVariant}
            handleEditPost={handleEditPost}
            handleDeletePost={handleDeletePost}
            isEditing={isEditing}
            comments={comments}
            commentControl={commentControl}
            handleCommentSubmit={handleCommentSubmit}
            watchComment={watchComment}
            handlePublish={handlePublish}
            formattedCreatedAt={formattedCreatedAt}
          />
        )}
      </div>
    </Modal>
  )
}

export default PostModal