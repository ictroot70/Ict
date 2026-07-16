'use client'

import React, { type ReactNode } from 'react'
import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { formatLikesCount } from '@/entities/posts/lib/format-likes'
import { ControlledInput } from '@/features/formControls'
import { Avatar, Skeleton } from '@/shared/composites'
import { CommentFormData, PostVariant } from '@/shared/types'
import {
  Button,
  Typography,
  BookmarkOutline,
  HeartOutline,
  PaperPlane,
  Separator,
} from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { RenderPostLikeAction } from '../../postModalLikeAction.types'

interface PostFooterProps {
  variant: PostVariant
  postId: number
  ownerId: number
  isLiked: boolean
  likesCount: number
  avatarWhoLikes: string[]
  isPostEngagementLoading: boolean
  renderPostLikeAction?: RenderPostLikeAction
  formattedCreatedAt: string
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
  isCreateCommentLoading: boolean
  commentMaxLength: number
}

export const ViewModePostFooter = ({
  variant,
  postId,
  ownerId,
  isLiked,
  likesCount,
  avatarWhoLikes,
  isPostEngagementLoading,
  renderPostLikeAction,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
  isCreateCommentLoading,
  commentMaxLength,
}: PostFooterProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const visibleAvatars = avatarWhoLikes?.filter(Boolean).slice(0, 3) || []
  const skeletonAvatarCount = Math.min(Math.max(likesCount, 0), 3)
  let likeAction: ReactNode = (
    <Button variant={'text'} className={s.postButton} aria-label={'Like post'}>
      <HeartOutline color={'white'} />
    </Button>
  )

  if (isPostEngagementLoading) {
    likeAction = (
      <Button variant={'text'} className={s.postButton} disabled tabIndex={-1} aria-hidden>
        <Skeleton className={s.postButtonSkeleton} />
      </Button>
    )
  } else if (renderPostLikeAction) {
    likeAction = renderPostLikeAction({
      postId,
      ownerId,
      isLiked,
      className: s.postButton,
    })
  }

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
              {likeAction}
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

      {isPostEngagementLoading ? (
        <div className={s.likesRow} aria-hidden={'true'}>
          {skeletonAvatarCount > 0 && (
            <div className={s.likesAvatars}>
              {Array.from({ length: skeletonAvatarCount }, (_, index) => (
                <Skeleton
                  className={[s.likeAvatarSkeleton, index > 0 ? s.likeAvatarOverlap : '']
                    .filter(Boolean)
                    .join(' ')}
                  key={index}
                />
              ))}
            </div>
          )}
          <Skeleton className={s.likesCountSkeleton} />
        </div>
      ) : (
        likesCount > 0 && (
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
        )
      )}

      {isPostEngagementLoading ? (
        <Skeleton className={s.timestampSkeleton} aria-hidden={'true'} />
      ) : (
        <Typography variant={'small_text'} className={s.timestamp}>
          {formattedCreatedAt}
        </Typography>
      )}

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
                placeholder={'Add a Comment...'}
                className={s.input}
                maxLength={commentMaxLength}
              />
              <Button
                variant={'text'}
                type={'submit'}
                disabled={!watchComment('comment')?.trim() || isCreateCommentLoading}
              >
                Publish
              </Button>
            </form>
          </>
        )
      )}
    </div>
  )
}
