'use client'

import { PostViewModel } from '@/entities/posts/api'
import { usePostComments } from '@/entities/posts/hooks'
import { ControlledInput } from '@/features/formControls'
import { Avatar } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import {
  BookmarkOutline,
  Button,
  HeartOutline,
  MessageCircleOutline,
  PaperPlane,
  Typography,
} from '@/shared/ui'
import Link from 'next/link'

import s from './FeedPostFooter.module.scss'

type Props = {
  post: PostViewModel
}

export function FeedPostFooter({ post }: Props) {
  const {
    totalCount,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    isCommentPublishing,
    commentMaxLength,
  } = usePostComments({
    postId: post.id,
  })

  const commentText = watchComment('comment') ?? ''
  const trimmedCommentText = commentText.trim()

  const isCommentInvalid =
    trimmedCommentText.length === 0 || trimmedCommentText.length > commentMaxLength

  return (
    <footer className={s.footer}>
      <div className={s.actions} aria-label={'Post actions'}>
        <Button
          variant={'text'}
          className={s.actionButton}
          type={'button'}
          aria-label={'Like post'}
          aria-pressed={post.isLiked}
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

        <Typography variant={'regular_14'} className={s.descriptionText}>
          <Link href={APP_ROUTES.PROFILE.ID(post.ownerId)}>
            <strong>{post.userName}</strong>
          </Link>
          {post.description}
        </Typography>
      </div>

      <div className={s.likes}>
        <div className={s.likeAvatars} aria-hidden={'true'}>
          {post.avatarWhoLikes.map((avatar, index) => (
            <Avatar className={s.likeAvatar} image={avatar} size={24} key={`${avatar}-${index}`} />
          ))}
        </div>
        <Typography variant={'regular_14'}>
          <span className={s.countComments}>{post.likesCount.toLocaleString('ru-RU')}</span>
          <span>&quot;</span>
          <strong>Like</strong>
          <span>&quot;</span>
        </Typography>
      </div>

      <Typography variant={'bold_14'} className={s.comments}>
        View All Comments ({totalCount})
      </Typography>

      <form className={s.commentForm} onSubmit={handleCommentSubmit(handlePublish)}>
        <ControlledInput
          name={'comment'}
          control={commentControl}
          inputType={'text'}
          placeholder={'Add a Comment'}
          className={s.input}
          maxLength={commentMaxLength}
        />

        <Button variant={'text'} type={'submit'} disabled={isCommentInvalid || isCommentPublishing}>
          Publish
        </Button>
      </form>
    </footer>
  )
}
