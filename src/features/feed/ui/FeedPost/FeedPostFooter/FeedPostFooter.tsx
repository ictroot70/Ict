import { PostViewModel } from '@/entities/posts/api'
import { Avatar } from '@/shared/composites'
import {
  BookmarkOutline,
  Button,
  HeartOutline,
  Input,
  MessageCircleOutline,
  PaperPlane,
  Typography,
} from '@/shared/ui'

import s from './FeedPostFooter.module.scss'

import { MOCK_COMMENTS_COUNT, MOCK_LIKED_BY_AVATARS, MOCK_LIKES_COUNT } from './feedPost.constants'

type Props = {
  post: PostViewModel
}

export function FeedPostFooter({ post }: Props) {
  return (
    <footer className={s.footer}>
      <div className={s.actions} aria-label={'Post actions'}>
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Like post'}
        >
          <HeartOutline />
        </Button>
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Comment on post'}
        >
          <MessageCircleOutline />
        </Button>
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Share post'}
        >
          <PaperPlane />
        </Button>
        <Button
          variant={'text'}
          className={`${s.actionButton} ${s.saveButton}`}
          type={'button'}
          aria-label={'Save post'}
        >
          <BookmarkOutline />
        </Button>
      </div>

      <div className={s.description}>
        <Avatar image={post.avatarOwner} size={36} alt={`${post.userName} avatar`} />
        <Typography variant={'regular_14'}>
          <strong>{post.userName}</strong> {post.description}
        </Typography>
      </div>

      <div className={s.likes}>
        <div className={s.likeAvatars} aria-hidden={'true'}>
          {MOCK_LIKED_BY_AVATARS.map((avatar, index) => (
            <Avatar className={s.likeAvatar} image={avatar} size={24} key={`${avatar}-${index}`} />
          ))}
        </div>
        <Typography variant={'regular_14'}>
          <span className={s.countComments}>{MOCK_LIKES_COUNT.toLocaleString('ru-RU')}</span>
          <span>&quot;</span>
          <strong>Like</strong>
          <span>&quot;</span>
        </Typography>
      </div>

      <Typography variant={'bold_14'} className={s.comments}>
        View All Comments ({MOCK_COMMENTS_COUNT})
      </Typography>

      <div className={s.commentForm}>
        <Input
          name={'comment'}
          inputType={'text'}
          placeholder={'Add a Comment'}
          className={s.input}
        />
        <Button variant={'text'}>Publish</Button>
      </div>
    </footer>
  )
}
