import { ReactElement, useState } from 'react'

import Image from 'next/image'

import { Button, Modal, Typography } from '@/shared/ui'

import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
import { Avatar } from '@/shared/composites'

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
}

type CommentForm = { comment: string }

export const PostModal = ({
  open,
  onClose,
  images,
  variant,
  userName,
  avatarOwner,
  createdAt,
  description
}: Props): ReactElement => {
  const [comments, setComments] = useState<string[]>([
    // 'Awesome shot! The colors are incredible.',
    // 'Looks like a perfect vacation spot.',
  ])

  const { control, handleSubmit, reset, watch } = useForm<CommentForm>({
    defaultValues: { comment: '' },
  })

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    reset()
  }

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt))

  return (
    <Modal open={open} onClose={onClose} closeBtnOutside={true} className={s.modal}>
      <div className={s.innerModal}>
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
                postId="post-123"
                onEdit={id => console.log('Edit post:', id)}
                onDelete={id => console.log('Delete post:', id)}
              />
            )}
          </div>

          <Separator/>
          <div className={s.comments}>
            <div className={s.comment}>
              <Avatar size={36} image={avatarOwner} />

              <div>
                <Typography variant={'regular_14'} color={'light'}>
                  <strong>{userName}</strong> {description}
                </Typography>
                <Typography variant="small_text" className={s.commentTimestamp}>
                  2 minute ago
                </Typography>
              </div>
            </div>
            {comments.map((comment, index) => (
              <div className={s.comment} key={index}>
                <Avatar size={36} image={avatarOwner} />

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
            {variant !== 'public' && (
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

            {variant !== 'public' && (
              <>
                <Separator className={s.separator}/>
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
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default PostModal
