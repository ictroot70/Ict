import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { LikeButton } from '@/features/postLikes/ui/LikeButton'
import { Avatar, Skeleton } from '@/shared/composites'
import { CommentFormData } from '@/shared/types'
import { Button, Typography, BookmarkOutline, PaperPlane, Separator } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface PostFooterProps {
  variant: 'public' | 'myPost' | 'userPost'
  postId: number
  ownerId: number
  isLiked: boolean
  likesCount: number
  avatarWhoLikes: string[]
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
  const visibleLikeAvatars = avatarWhoLikes.filter(Boolean).slice(0, 3)

  const commentText = watchComment('comment') ?? ''
  const trimmedCommentText = commentText.trim()
  const isCommentInvalid =
    trimmedCommentText.length === 0 || trimmedCommentText.length > commentMaxLength

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
              <LikeButton
                postId={postId}
                ownerId={ownerId}
                isLiked={isLiked}
                className={s.postButton}
              />
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
        {visibleLikeAvatars.length > 0 && (
          <div className={s.likesAvatars}>
            {visibleLikeAvatars.map((url, index) => (
              <Avatar
                key={`${url}-${index}`}
                size={24}
                image={url}
                className={`${s.likeAvatar} ${s[`likeAvatar${index + 1}`]}`}
              />
            ))}
          </div>
        )}
        <Typography variant={'regular_14'} color={'light'}>
          {likesCount} <strong>Likes</strong>
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
                maxLength={commentMaxLength}
              />
              <Button
                variant={'text'}
                type={'submit'}
                disabled={isCommentInvalid || isCreateCommentLoading}
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
