import { PostViewModel } from '@/entities/posts/api'
import { PostContentHeader } from './PostContentHeader/PostContentHeader'
import { PostContentMain } from './PostContentMain/PostContentMain'
import { Separator } from '@ictroot/ui-kit'
import { PostContentFooter } from './PostContentFooter/PostContentFooter'

import s from './PostContent.module.scss'

type Props = {
  post: PostViewModel
}

export const PostContent = ({ post }: Props) => {
  const { avatarOwner, userName, description, likesCount, createdAt } = post
  return (
    <div className={s.wrapper}>
      <PostContentHeader avatar={avatarOwner} userName={userName} />
      <Separator />
      <PostContentMain avatar={avatarOwner} userName={userName} description={description} />
      <Separator />
      <PostContentFooter createdAt={createdAt} likesCount={likesCount} />
    </div>
  )
}
