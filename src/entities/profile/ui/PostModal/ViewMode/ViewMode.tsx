import Image from 'next/image'
import { Button, Typography } from '@/shared/ui'
import s from '../PostModal.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { ControlledInput } from '@/features/formControls'
import { useForm } from 'react-hook-form'
import PostActions from '../PostActions/PostActions'
import { EditDeletePost } from '@/widgets/Header/components/EditDeletePost/EditDeletePost'

type CommentForm = { comment: string }

type Props = {
  effectiveImages: { url: string }[]
  effectiveAvatar: string
  effectiveUserName: string
  effectiveDescription: string
  effectivePostId: string
  effectiveCreatedAt: string
  computedVariant: 'public' | 'myPost' | 'userPost'
  handleEditPost: () => void
  handleDeletePost: () => void
  isEditing: boolean | undefined
  comments: string[]
  commentControl: any
  handleCommentSubmit: any
  watchComment: (field: string) => string
  handlePublish: (data: CommentForm) => void
  formattedCreatedAt: string
}

export const ViewMode = ({
  effectiveImages,
  effectiveAvatar,
  effectiveUserName,
  effectiveDescription,
  effectivePostId,
  effectiveCreatedAt,
  computedVariant,
  handleEditPost,
  handleDeletePost,
  isEditing,
  comments,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt
}: Props) => {
  return (
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
  )
}