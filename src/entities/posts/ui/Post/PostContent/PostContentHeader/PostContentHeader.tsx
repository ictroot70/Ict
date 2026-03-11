import s from './PostContentHeader.module.scss'

import { Avatar } from '@/shared/composites'
import { Typography } from '@ictroot/ui-kit'
import { PostActions } from '../../PostActions/PostActions'

type Props = {
  avatar: string
  userName: string
}

export const PostContentHeader = ({ avatar, userName }: Props) => {
  return (
    <div className={s.header}>
      <div className={s.user}>
        <Avatar size={36} image={avatar} />
        <Typography variant={'h3'} color={'light'}>
          {userName}
        </Typography>
      </div>
      <PostActions />
    </div>
  )
}
