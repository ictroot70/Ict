import { ReactElement, useState } from 'react'

import Image from 'next/image'

import { Button, Modal, Typography } from '@/shared/ui'

import s from './PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { useGetPostByIdQuery } from '@/entities/posts/api/postApi'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/posts/utils/useAuth'

type Props = {
  open: boolean
  onClose: () => void
}

type CommentForm = { comment: string }

export const PostModal = ({
  open,
  onClose,
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

  const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(effectiveCreatedAt))

  return (
    <Modal open={open} onClose={onClose} closeBtnOutside={true} className={s.modal}>
      <div className={s.innerModal}>
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
            <Image
              src={effectiveImages[0]?.url}
              alt={'Post image'}
              fill
              className={s.image}
            />
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

            {computedVariant !== 'public' && (
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
