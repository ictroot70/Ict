import React from 'react'
import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { Skeleton } from '@/shared/composites'
import { CommentFormData } from '@/shared/types'
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
  variant: 'public' | 'myPost' | 'userPost'
  formattedCreatedAt: string
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
}

export const ViewModePostFooter: React.FC<PostFooterProps> = ({
  variant,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
}) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading

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
              <Button variant={'text'} className={s.postButton}>
                <HeartOutline color={'white'} />
              </Button>
              <Button variant={'text'} className={s.postButton}>
                <PaperPlane color={'white'} />
              </Button>
              <Button variant={'text'} className={s.postButton}>
                <BookmarkOutline color={'white'} />
              </Button>
            </>
          )}
        </div>
      )}

      <div className={s.likesRow}>
        <div className={s.likesAvatars}>
          <div className={`${s.likeAvatar} ${s.likeAvatar1}`} />
          <div className={`${s.likeAvatar} ${s.likeAvatar2}`} />
          <div className={`${s.likeAvatar} ${s.likeAvatar3}`} />
        </div>
        <Typography variant={'regular_14'} color={'light'}>
          2,243 <strong>Likes</strong>
        </Typography>
      </div>

      <Typography variant={'small_text'} className={s.timestamp}>
        {formattedCreatedAt}
      </Typography>

      {shouldShowAuthSkeleton ? (
        <>
          <Separator className={s.separator} />
          <div className={s.inputForm} aria-hidden>
            <Skeleton className={s.inputSkeleton} />
            <Skeleton className={s.publishSkeleton} />
          </div>
        </>
      ) : (
        shouldShowAuthActions && (
          <>
            <Separator className={s.separator} />
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
