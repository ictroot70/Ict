'use client'

import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Typography } from '@/shared/ui'
import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
import { Avatar } from '@/shared/composites'
import { DeletePostModal } from '../DeletePostModal'

type CommentForm = { comment: string }

type Props = {
  variant: 'public' | 'myPost' | 'userPost'
  open: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  avatarOwner?: string
  userName: string
  createdAt: string
  description?: string
  postId: string
  userId: number
  onEditPost?: (postId: string) => void
  onDeletePost?: (postId: string) => void
  isEditing?: boolean
}

export const PostModal = ({
  open,
  onClose,
  images,
  variant,
  userName,
  avatarOwner,
  createdAt,
  description,
  postId,
  userId,
  onEditPost,
  onDeletePost,
  isEditing,
}: Props): ReactElement => {
  const [comments, setComments] = useState<string[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { control, handleSubmit, reset, watch } = useForm<CommentForm>({
    defaultValues: { comment: '' },
  })

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    reset()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  const handleEditPost = () => {
    if (onEditPost) {
      onEditPost(postId)
    }
  }

  const handleDeletePost = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (onDeletePost) {
      setIsDeleting(true)
      try {
        onDeletePost(postId)
        setIsDeleteModalOpen(false)
        onClose()
      } catch (error) {
        console.error('Failed to delete post:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
  }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt))

  return (
    <>
      <Modal open={open} onClose={onClose} closeBtnOutside className={s.modal}>
        <div className={s.innerModal} onClick={handleOverlayClick}>
          <div className={s.photoContainer}>
            {images.length > 1 ? (
              <EmblaCarousel photos={images} />
            ) : (
              <Image src={images[0]} alt={'Post image'} fill className={s.image} />
            )}
          </div>
          <div className={s.postSideBar}>
            <div className={s.postHeader}>
              <div className={s.username}>
                <Avatar size={36} image={avatarOwner} />
                <Typography variant={'h3'} color={'light'}>
                  {userName}
                </Typography>
              </div>

              {variant !== 'public' && (
                <EditDeletePost
                  postId={postId}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  isEditing={isEditing}
                />
              )}
            </div>

            <Separator className={s.separator} />
            <div className={s.comments}>
              <div className={s.comment}>
                <Avatar size={36} image={avatarOwner} />
                <div>
                  <Typography variant={'regular_14'} color={'light'}>
                    <strong>{userName}</strong> {description}
                  </Typography>
                  <Typography variant="small_text" className={s.commentTimestamp}>
                    {formattedCreatedAt}
                  </Typography>
                </div>
              </div>
              {comments.map((comment, index) => (
                <div className={s.comment} key={index}>
                  <Avatar size={36} image={avatarOwner} />
                  <div>
                    <Typography variant={'regular_14'} color={'light'}>
                      <strong>UserName</strong> {comment}
                    </Typography>
                    <Typography variant="small_text" className={s.commentTimestamp}>
                      Just now
                    </Typography>
                  </div>
                  <Button variant={'text'} className={s.commentLikeButton}>
                    <HeartOutline size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Separator className={s.separator} />

            <div className={s.footer}>
              <div className={s.likeSendSave}>
                <Button variant={'text'} className={s.postButton}>
                  <HeartOutline />
                </Button>
                <Button variant={'text'} className={s.postButton}>
                  <PaperPlane />
                </Button>
                <Button variant={'text'} className={s.postButton}>
                  <BookmarkOutline />
                </Button>
              </div>

              <div className={s.likesRow} style={{ textWrap: 'wrap' }}>
                <div className={s.likesAvatars}>
                  <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
                  <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
                  <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
                </div>
                <div>
                  <Typography variant={'regular_14'} color={'light'}>
                    2 243 <strong>likes</strong>
                  </Typography>
                </div>
              </div>
              <Typography variant="small_text" className={s.timestamp}>
                {formattedCreatedAt}
              </Typography>
              <Separator />

              {variant !== 'public' && (
                <form onSubmit={handleSubmit(handlePublish)} className={s.inputForm}>
                  <ControlledInput<CommentForm>
                    name={'comment'}
                    control={control}
                    inputType={'text'}
                    placeholder={'Add a Comment'}
                    className={s.input}
                  />
                  <Button variant={'text'} type={'submit'} disabled={!watch('comment')?.trim()}>
                    Publish
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}

export default PostModal