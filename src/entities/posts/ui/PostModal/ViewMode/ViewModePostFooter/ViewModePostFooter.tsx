'use client'

import React from 'react'
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
  renderPostLikeAction?: RenderPostLikeAction
  formattedCreatedAt: string
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => Promise<boolean>
  isAuthLoading: boolean
  isCreateCommentLoading: boolean
  isReplyPublishing: boolean
  commentMaxLength: number
}

export const ViewModePostFooter = ({
  variant,
  postId,
  ownerId,
  isLiked,
  likesCount,
  avatarWhoLikes,
  renderPostLikeAction,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
  isCreateCommentLoading,
  isReplyPublishing,
  commentMaxLength,
}: PostFooterProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const visibleAvatars = avatarWhoLikes?.filter(Boolean).slice(0, 3) || []

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
              {renderPostLikeAction ? (
                renderPostLikeAction({
                  postId,
                  ownerId,
                  isLiked,
                  className: s.postButton,
                })
              ) : (
                <Button variant={'text'} className={s.postButton} aria-label={'Like post'}>
                  <HeartOutline color={'white'} />
                </Button>
              )}
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
              <div className={s.commentInputWrapper}>
                <ControlledInput
                  name={'comment'}
                  control={commentControl}
                  inputType={'text'}
                  placeholder={'Add a Comment...'}
                  className={s.input}
                  maxLength={commentMaxLength}
                  disabled={isReplyPublishing}
                />
                {isReplyPublishing && <span className={s.replyLoader} aria-hidden={'true'} />}
              </div>
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
