'use client'

import React from 'react'
import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { formatLikesCount } from '@/entities/posts/lib/format-likes'
import { ControlledInput } from '@/features/formControls'
import { Avatar, Skeleton } from '@/shared/composites'
import { CommentFormData, PostModalData, PostVariant } from '@/shared/types'
import {
  Button,
  Typography,
  BookmarkOutline,
  HeartOutline,
  PaperPlane,
  Separator,
} from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface PostFooterProps {
  variant: PostVariant
  postData: Pick<PostModalData, 'likesCount' | 'avatarWhoLikes'>
  formattedCreatedAt: string
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
}

export const ViewModePostFooter: React.FC<PostFooterProps> = ({
  variant,
  postData,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
}) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading

  const { likesCount, avatarWhoLikes } = postData
  const visibleAvatars = avatarWhoLikes?.slice(0, 3) || []

  return (
    <div className={s.footer}>
      {(shouldShowAuthActions || shouldShowAuthSkeleton) && (
        <div className={s.likeSendSave}>
          {shouldShowAuthSkeleton ? (
            <>
              <Button variant={'text'} className={s.postButton} disabled tabIndex={-1} aria-hidden>
                <Skeleton className={s.postButtonSkeleton} />
              </Button>
              <Button variant={'text'} className={s.postButton} disabled tabIndex={-1} aria-hidden>
                <Skeleton className={s.postButtonSkeleton} />
              </Button>
              <Button variant={'text'} className={s.postButton} disabled tabIndex={-1} aria-hidden>
                <Skeleton className={s.postButtonSkeleton} />
              </Button>
            </>
          ) : (
            <>
              <Button variant={'text'} className={s.postButton} aria-label={'Like post'}>
                <HeartOutline color={'white'} />
              </Button>
              <Button variant={'text'} className={s.postButton} aria-label={'Share post'}>
                <PaperPlane color={'white'} />
              </Button>
              <Button variant={'text'} className={s.postButton} aria-label={'Save post'}>
                <BookmarkOutline color={'white'} />
              </Button>
            </>
          )}
        </div>
      )}

      {likesCount > 0 && (
        <div className={s.likesRow}>
          {visibleAvatars.length > 0 && (
            <div className={s.likesAvatars}>
              {visibleAvatars.map((avatarUrl, index) => (
                <Avatar
                  key={`${avatarUrl}-${index}`}
                  size={24}
                  image={avatarUrl}
                  className={index > 0 ? s.likeAvatarOverlap : undefined}
                />
              ))}
            </div>
          )}
          <Typography variant={'regular_14'} color={'light'}>
            <strong>{formatLikesCount(likesCount)}</strong>
          </Typography>
        </div>
      )}

      <Typography variant={'small_text'} className={s.timestamp}>
        {formattedCreatedAt}
      </Typography>

      {shouldShowAuthSkeleton ? (
        <>
          <Separator className={s.fullWidthSeparator} />
          <div className={s.inputForm} aria-hidden>
            <Skeleton className={s.inputSkeleton} />
            <Skeleton className={s.publishSkeleton} />
          </div>
        </>
      ) : (
        shouldShowAuthActions && (
          <>
            <Separator className={s.fullWidthSeparator} />
            <form onSubmit={handleCommentSubmit(handlePublish)} className={s.inputForm}>
              <ControlledInput
                name={'comment'}
                control={commentControl}
                inputType={'text'}
                placeholder={'Add a Comment'}
                className={s.input}
              />
              <Button variant={'text'} type={'submit'} disabled={!watchComment('comment')?.trim()}>
                Publish
              </Button>
            </form>
          </>
        )
      )}
    </div>
  )
}
