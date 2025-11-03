'use client'

import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Typography } from '@/shared/ui'
import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/posts/utils/useAuth'
import PostActions from './PostActions/PostActions'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
// УДАЛИТЕ этот импорт - модалка удаления теперь в Profile
// import { DeletePostModal } from '../DeletePostModal'
import { ControlledTextarea } from '@/features/formControls/textarea/ui'

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

  const descriptionValue = watchDescription('description') || ''
  const characterCount = descriptionValue.length
  const maxCharacters = 500

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    resetComment()
  }

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

  // Сбрасываем форму редактирования при изменении описания
  useEffect(() => {
    resetDescription({ description: effectiveDescription })
  }, [effectiveDescription, resetDescription])

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingDescription) {
          handleCancelEdit()
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
    console.log(`PostModal: открывается модалка удаления для поста ${effectivePostId}`)
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
    <>
      <Modal open={open} onClose={onClose} closeBtnOutside={true} className={s.modal}>
        <div className={s.innerModal} onClick={handleOverlayClick}>
          {/* Режим редактирования */}
          {isEditingDescription ? (
            <div className={s.editMode}>
              {/* Шапка редактирования */}
              <div className={s.editHeader}>
                <Typography variant="h1" className={s.editTitle}>
                  Edit Post
                </Typography>
                <Button
                  variant="text"
                  onClick={handleCancelEdit}
                  className={s.closeButton}
                >
                  {/* <CloseOutline size={24} /> */}
                </Button>
              </div>

              <div className={s.editContent}>
                {/* Левая часть - изображение */}
                <div className={s.editImageContainer}>
                  {effectiveImages.length > 1 ? (
                    <Carousel
                      slides={effectiveImages}
                      options={{
                        align: 'center',
                        loop: false,
                      }}
                    />
                  ) : effectiveImages.length === 1 ? (
                    <Image src={effectiveImages[0]?.url} alt={'Post image'} fill className={s.editImage} />
                  ) : null}
                </div>

                {/* Правая часть - форма редактирования */}
                <div className={s.editFormContainer}>
                  <div className={s.userInfo}>
                    <Avatar size={36} image={effectiveAvatar} />
                    <Typography variant={'h3'} color={'light'}>
                      {effectiveUserName}
                    </Typography>
                  </div>

                  <div className={s.editFormSection}>
                    <Typography variant="regular_14" className={s.formLabel}>
                      Add publication descriptions
                    </Typography>

                    <form onSubmit={handleDescriptionSubmit(handleSaveDescription)} className={s.editDescriptionForm}>
                      <ControlledTextarea<EditDescriptionForm>
                        name={'description'}
                        control={descriptionControl}
                        placeholder={'Write your description here...'}
                        className={s.descriptionTextarea}
                        rules={{
                          maxLength: {
                            value: maxCharacters,
                            message: `Description must be less than ${maxCharacters} characters`
                          }
                        }}
                      />
                      <div className={s.characterCounter}>
                        <Typography
                          variant="small_text"
                          className={characterCount > maxCharacters ? s.characterError : s.characterInfo}
                        >
                          {characterCount}/{maxCharacters}
                        </Typography>
                      </div>

                      {errors.description && (
                        <Typography variant="small_text" className={s.errorMessage}>
                          {errors.description.message}
                        </Typography>
                      )}

                      <div className={s.editDescriptionActions}>
                        <Button
                          variant={'outlined'}
                          type="button"
                          onClick={handleCancelEdit}
                          className={s.cancelEditButton}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={'primary'}
                          type={'submit'}
                          disabled={!descriptionValue.trim() || characterCount > maxCharacters}
                          className={s.saveEditButton}
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Обычный режим просмотра */
            <div className={s.viewMode}>
              <div className={s.photoContainer}>
                {effectiveImages.length > 1 ? (
                  <Carousel
                    slides={effectiveImages}
                    options={{
                      align: 'center',
                      loop: false,
                    }}
                  />
                ) : effectiveImages.length === 1 ? (
                  <Image src={effectiveImages[0]?.url} alt={'Post image'} fill className={s.image} />
                ) : null}
              </div>
              <div className={s.postSideBar}>
                <div className={s.postHeader}>
                  <div className={s.username}>
                    <Avatar size={36} image={effectiveAvatar} />
                    <Typography variant={'h3'} color={'light'}>
                      {effectiveUserName}
                    </Typography>
                  </div>

                  {computedVariant === 'myPost' ? (
                    <EditDeletePost
                      postId={effectivePostId}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      isEditing={isEditing}
                    />
                  ) : computedVariant === 'userPost' ? (
                    <PostActions variant={computedVariant} />
                  ) : null}
                </div>

                <Separator />
                <div className={s.comments}>
                  <div className={s.comment}>
                    <Avatar size={36} image={effectiveAvatar} />
                    <div>
                      <Typography variant={'regular_14'} color={'light'}>
                        <strong>{effectiveUserName}</strong> {effectiveDescription}
                      </Typography>
                      <Typography variant="small_text" className={s.commentTimestamp}>
                        2 minute ago
                      </Typography>
                    </div>
                  </div>
                  {comments.map((comment, index) => (
                    <div className={s.comment} key={index}>
                      <Avatar size={36} image={effectiveAvatar} />
                      <div>
                        <Typography variant={'regular_14'} color={'light'}>
                          <strong> UserName</strong> {comment}
                        </Typography>
                        <Typography variant="small_text" className={s.commentTimestamp}>
                          2 minute ago
                        </Typography>
                      </div>
                      <Button variant={'text'} className={s.commentLikeButton}>
                        <HeartOutline size={16} color={'white'} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator />

                <div className={s.footer}>
                  {computedVariant !== 'public' && (
                    <div className={s.likeSendSave}>
                      <Button variant={'text'} className={s.postButton}>
                        <HeartOutline color={'white'} />
                      </Button>
                      <Button variant={'text'} className={s.postButton}>
                        <PaperPlane color={'white'} />
                      </Button>
                      <Button variant={'text'} className={s.postButton}>
                        <BookmarkOutline color={'white'} />
                      </Button>
                    </div>
                  )}
                  <div className={s.likesRow} style={{ textWrap: 'wrap' }}>
                    <div className={s.likesAvatars}>
                      <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
                      <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
                      <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
                    </div>
                    <div>
                      <Typography variant={'regular_14'} color={'light'}>
                        2 243 "<strong>Like</strong>"
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="small_text" className={s.timestamp}>
                    {formattedCreatedAt}
                  </Typography>

                  {computedVariant !== 'public' && (
                    <>
                      <Separator className={s.separator} />
                      <form onSubmit={handleCommentSubmit(handlePublish)} className={s.inputForm}>
                        <ControlledInput<CommentForm>
                          name={'comment'}
                          control={commentControl}
                          inputType={'text'}
                          placeholder={'Add a Comment'}
                          className={s.input}
                        />
                        <Button variant={'text'} type={'submit'} disabled={!watchComment('comment')?.trim()}>
                          Publish
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default PostModal