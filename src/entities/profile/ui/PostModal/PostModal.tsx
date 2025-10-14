'use client'

import { ReactElement, useMemo, useState } from 'react'

import Image from 'next/image'

import { Button, Modal, Typography } from '@/shared/ui'
import { UserImage } from '@/entities/users/api/api.types'

import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'

type Props = {
  variant: 'public' | 'myPost' | 'userPost'
  open: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
}

type CommentForm = { comment: string }

export const PostModal = ({
  open,
  onClose,
  images,
  variant,
}: Props): ReactElement => {
  const [comments, setComments] = useState<string[]>([
    'Awesome shot! The colors are incredible.',
    'Looks like a perfect vacation spot.',
  ])

  const { control, handleSubmit, reset, watch } = useForm<CommentForm>({
    defaultValues: { comment: '' },
  })

  const slides: UserImage[] = useMemo(() => {
    return images.map((url, idx) => ({
      url,
      createdAt: new Date().toISOString(),
      fileSize: 0,
      height: 0,
      uploadId: String(idx),
      width: 0,
    }))
  }, [images])

  const handlePublish = ({ comment }: CommentForm) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    setComments(prev => [...prev, trimmed])
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} closeBtnOutside className={s.modal}>
      <div className={s.innerModal}>
        <div className={s.photoContainer}>
          {/*<img width={'100%'} src="https://cbc-group.kz/images/man.png" alt="man" />*/}
          {images.length > 1 ? (
            // <Carousel slides={slides} options={{ startIndex: initialIndex }} />
            <EmblaCarousel photos={images} />
          ) : (
            <Image src={images[0]} alt={'Post image'} fill className={s.image} />
          )}
        </div>
        <div className={s.postSideBar}>
          <div className={s.postHeader}>
            <div className={s.username}>
              <div className={s.avatar} />
              <Typography variant={'h3'} color={'light'}>
                UserName
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

          <Separator className={s.separator}/>
          <div className={s.comments}>
            {comments.map((comment, index) => (
              <div className={s.commentRow} key={index}>
                <div className={`${s.commentAvatar} ${s.commentAvatar1}`} />
                <div>
                  <Typography variant={'regular_14'} color={'light'}>
                    <strong> UserName</strong> {comment}
                  </Typography>
                  <Typography variant="small_text" className={s.timestamp}>
                    2 minute ago
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <Separator className={s.separator}/>

          <div className={s.footer}>
            <div className={s.likeSendSave}>
              <HeartOutline />
              <PaperPlane />
              <BookmarkOutline />
            </div>

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
              July 3, 2021
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
  )
}

export default PostModal
