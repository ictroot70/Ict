// components/PostFooter.tsx
import { Button, Typography } from '@/shared/ui'
import { Separator } from '@ictroot/ui-kit'
import { BookmarkOutline, HeartOutline, PaperPlane } from '@ictroot/ui-kit'
import { ControlledInput } from '@/features/formControls'
import { CommentFormData } from '@/shared/types'
import s from '../ViewMode.module.scss'

interface PostFooterProps {
  variant: 'public' | 'myPost' | 'userPost'
  formattedCreatedAt: string
  commentControl: any
  handleCommentSubmit: any
  watchComment: (field: string) => string
  handlePublish: (data: CommentFormData) => void
}

export const ViewModePostFooter: React.FC<PostFooterProps> = ({
  variant,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
}) => {
  return (
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
  )
}