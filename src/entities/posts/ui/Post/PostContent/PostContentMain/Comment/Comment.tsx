import { Button, HeartOutline, Typography } from '@ictroot/ui-kit'
import s from './Comment.module.scss'
import { Avatar } from '@/shared/composites'

type Props = {
  name: string
  avatar: string
  message: string
  isAnswer?: boolean
}

export const Comment = ({ isAnswer = false, avatar, name, message }: Props) => {
  return (
    <div className={s.comment}>
      <Avatar size={36} image={avatar} />
      <div>
        <Typography variant={'regular_14'} color={'light'} className={s.message}>
          <strong>{name}</strong> {message}
        </Typography>
        <Typography variant={'small_text'} className={s.commentTimestamp}>
          2 minutes ago
        </Typography>
      </div>
      {isAnswer && (
        <Button variant={'text'} className={s.commentLikeButton}>
          <HeartOutline size={16} color={'white'} />
        </Button>
      )}
    </div>
  )
}
