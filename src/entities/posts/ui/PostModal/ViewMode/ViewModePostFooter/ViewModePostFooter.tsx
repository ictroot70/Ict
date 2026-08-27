'use client'

import React from 'react'
import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { formatLikesCount } from '@/entities/posts/lib/format-likes'
import { ControlledInput } from '@/features/formControls'
import { Avatar, Skeleton } from '@/shared/composites'
import { COMMENT_CONTENT_MAX, CommentFormData, PostVariant } from '@/shared/types'
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
  auth: {
    isLoading: boolean
  }
  comments: {
    control: Control<CommentFormData>
    handlePublish: (data: CommentFormData) => Promise<boolean>
    handleSubmit: UseFormHandleSubmit<CommentFormData>
    isPublishing: boolean
    watch: UseFormWatch<CommentFormData>
  }
  post: {
    formattedCreatedAt: string
    variant: PostVariant
  }
  postData: {
    avatarWhoLikes: string[]
    id: number
    isLiked: boolean
    likesCount: number
    ownerId: number
  }
  renderPostLikeAction?: RenderPostLikeAction
}

export const ViewModePostFooter = ({
  auth,
  comments,
  post,
  postData,
  renderPostLikeAction,
}: PostFooterProps) => {
  const shouldShowAuthActions = post.variant !== 'public'
  const shouldShowAuthSkeleton = auth.isLoading
  const visibleAvatars = postData.avatarWhoLikes?.filter(Boolean).slice(0, 3) || []

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
                  postId: postData.id,
                  ownerId: postData.ownerId,
                  isLiked: postData.isLiked,
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

      {postData.likesCount > 0 && (
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
            <strong>{formatLikesCount(postData.likesCount)}</strong>
          </Typography>
        </div>
      )}

      <Typography variant={'small_text'} className={s.timestamp}>
        {post.formattedCreatedAt}
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
            <form onSubmit={comments.handleSubmit(comments.handlePublish)} className={s.inputForm}>
              <div className={s.commentInputWrapper}>
                <ControlledInput
                  name={'comment'}
                  control={comments.control}
                  inputType={'text'}
                  placeholder={'Add a Comment...'}
                  className={s.input}
                  maxLength={COMMENT_CONTENT_MAX}
                  disabled={comments.isPublishing}
                />
                {comments.isPublishing && <span className={s.replyLoader} aria-hidden={'true'} />}
              </div>
              <Button
                variant={'text'}
                type={'submit'}
                disabled={!comments.watch('comment')?.trim() || comments.isPublishing}
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
