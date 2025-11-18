import Image from 'next/image'
import { Button, Typography } from '@/shared/ui'
import s from './ViewMode.module.scss'
import { BookmarkOutline, HeartOutline, PaperPlane, Separator } from '@ictroot/ui-kit'
import { Avatar } from '@/shared/composites'
import Carousel from '@/entities/users/ui/public/PublicPost/Carousel/Carousel'
import { ControlledInput } from '@/features/formControls'
import PostActions from '../PostActions/PostActions'
import { PostModalData, PostVariant } from '@/shared/types'

interface ViewModeProps {
  onClose: () => void
  postData: PostModalData
  variant: PostVariant
  handleEditPost: () => void
  handleDeletePost: () => void
  isEditing?: boolean
  comments: string[]
  commentControl: any
  handleCommentSubmit: any
  watchComment: (field: string) => string
  handlePublish: (data: { comment: string }) => void
  formattedCreatedAt: string
  isAuthenticated: boolean
  isOwnProfile: boolean
}

export const ViewMode = ({
  onClose,
  postData,
  variant,
  handleEditPost,
  handleDeletePost,
  isEditing,
  comments,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
  isAuthenticated,
  isOwnProfile
}: ViewModeProps) => {

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleFollow = () => console.log('Follow functionality')

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      console.log('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className={s.modalOverlay} onClick={handleOverlayClick}>
      <div className={s.viewMode} onClick={(e) => e.stopPropagation()}>
        <div className={s.photoContainer}>
          {postData.images.length > 1 ? (
            <Carousel
              slides={postData.images}
              options={{ align: 'center', loop: false }}
            />
          ) : postData.images.length === 1 ? (
            <Image
              src={postData.images[0].url}
              alt="Post image"
              fill
              className={s.image}
            />
          ) : null}
        </div>

        <div className={s.postSideBar}>
          <div className={s.postHeader}>
            <div className={s.username}>
              <Avatar size={36} image={postData.avatar} />
              <Typography variant="h3" color="light">
                {postData.userName}
              </Typography>
            </div>

            {variant === 'myPost' ? (
              <PostActions
                variant="myPost"
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ) : variant === 'userPost' ? (
              <PostActions
                variant="userPost"
                onFollow={handleFollow}
                onCopyLink={handleCopyLink}
              />
            ) : null}
          </div>

          <Separator />

          <div className={s.comments}>
            <div className={s.comment}>
              <Avatar size={36} image={postData.avatar} />
              <div>
                <Typography variant="regular_14" color="light">
                  <strong>{postData.userName}</strong> {postData.description}
                </Typography>
                <Typography variant="small_text" className={s.commentTimestamp}>
                  2 minutes ago
                </Typography>
              </div>
            </div>

            {comments.map((comment, index) => (
              <div className={s.comment} key={index}>
                <Avatar size={36} image={postData.avatar} />
                <div>
                  <Typography variant="regular_14" color="light">
                    <strong>UserName</strong> {comment}
                  </Typography>
                  <Typography variant="small_text" className={s.commentTimestamp}>
                    2 minutes ago
                  </Typography>
                </div>
                <Button variant="text" className={s.commentLikeButton}>
                  <HeartOutline size={16} color="white" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className={s.footer}>
            {variant !== 'public' && (
              <div className={s.likeSendSave}>
                <Button variant="text" className={s.postButton}>
                  <HeartOutline color="white" />
                </Button>
                <Button variant="text" className={s.postButton}>
                  <PaperPlane color="white" />
                </Button>
                <Button variant="text" className={s.postButton}>
                  <BookmarkOutline color="white" />
                </Button>
              </div>
            )}

            <div className={s.likesRow}>
              <div className={s.likesAvatars}>
                <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
                <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
                <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
              </div>
              <Typography variant="regular_14" color="light">
                2,243 <strong>Likes</strong>
              </Typography>
            </div>

            <Typography variant="small_text" className={s.timestamp}>
              {formattedCreatedAt}
            </Typography>

            {variant !== 'public' && (
              <>
                <Separator className={s.separator} />
                <form onSubmit={handleCommentSubmit(handlePublish)} className={s.inputForm}>
                  <ControlledInput
                    name="comment"
                    control={commentControl}
                    inputType="text"
                    placeholder="Add a Comment"
                    className={s.input}
                  />
                  <Button
                    variant="text"
                    type="submit"
                    disabled={!watchComment('comment')?.trim()}
                  >
                    Publish
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}