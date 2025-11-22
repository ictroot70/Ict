import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { Separator } from '@ictroot/ui-kit'
import { HeartOutline } from '@ictroot/ui-kit'
import s from '../ViewMode.module.scss'

interface CommentsSectionProps {
  postData: {
    avatar: string
    userName: string
    description: string
  }
  comments: string[]
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({ postData, comments }) => {
  return (
    <>
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
    </>
  )
}
