// components/PostHeader.tsx
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { PostVariant } from '@/shared/types'
import s from '../ViewMode.module.scss'
import PostActions from '../../PostActions/PostActions'

interface PostHeaderProps {
  postData: {
    avatar: string
    userName: string
  }
  variant: PostVariant
  onEdit: () => void
  onDelete: () => void
  onFollow: () => void
  onCopyLink: () => void
}

export const ViewModePostHeader: React.FC<PostHeaderProps> = ({
  postData,
  variant,
  onEdit,
  onDelete,
  onFollow,
  onCopyLink,
}) => {
  return (
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
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : variant === 'userPost' ? (
        <PostActions
          variant="userPost"
          onFollow={onFollow}
          onCopyLink={onCopyLink}
        />
      ) : null}
    </div>
  )
}