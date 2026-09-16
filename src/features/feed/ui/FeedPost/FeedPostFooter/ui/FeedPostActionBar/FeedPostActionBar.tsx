'use client'

import type { CurrentPostLikeUser } from '@/features/postLikes/model/useLike'

import { LikeButton } from '@/features/postLikes/ui/LikeButton'
import { BookmarkOutline, Button, MessageCircleOutline, PaperPlane } from '@/shared/ui'

import s from './FeedPostActionBar.module.scss'

type Props = {
  currentUser?: CurrentPostLikeUser
  isLiked: boolean
  onOpenComments: () => void
  ownerId: number
  postId: number
}

export function FeedPostActionBar({
  currentUser,
  isLiked,
  onOpenComments,
  ownerId,
  postId,
}: Props) {
  return (
    <div className={s.actions} aria-label={'Post actions'}>
      <LikeButton
        className={s.actionButton}
        postId={postId}
        ownerId={ownerId}
        isLiked={isLiked}
        currentUser={currentUser}
      />
      <Button
        variant={'text'}
        className={s.actionButton}
        type={'button'}
        aria-label={'Comment on post'}
        onClick={onOpenComments}
      >
        <MessageCircleOutline />
      </Button>
      <Button variant={'text'} className={s.actionButton} type={'button'} aria-label={'Share post'}>
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
  )
}
