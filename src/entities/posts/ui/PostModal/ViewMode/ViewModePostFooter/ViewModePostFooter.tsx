import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { Avatar, Skeleton } from '@/shared/composites'
import { CommentFormData, PostModalData } from '@/shared/types'
import {
  Button,
  Typography,
  BookmarkOutline,
  HeartFilled,
  HeartOutline,
  PaperPlane,
  Separator,
} from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface PostFooterProps {
  variant: 'public' | 'myPost' | 'userPost'
  postData: Pick<PostModalData, 'likesCount' | 'isLiked' | 'avatarWhoLikes'>
  formattedCreatedAt: string
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
  isPublishingComment: boolean
  isPostLikeLoading: boolean
  commentMaxLength: number
  onTogglePostLike: () => void
}

const formatLikesCount = (count: number): string => {
  if (count === 1) {
    return '1 like'
  }

  return `${count.toLocaleString()} likes`
}

export const ViewModePostFooter = ({
  variant,
  postData,
  formattedCreatedAt,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  isAuthLoading,
  isPublishingComment,
  isPostLikeLoading,
  commentMaxLength,
  onTogglePostLike,
}: PostFooterProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const { likesCount, isLiked, avatarWhoLikes } = postData
  const visibleAvatars = avatarWhoLikes.slice(0, 3)

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
              <Button
                variant={'text'}
                className={s.postButton}
                onClick={onTogglePostLike}
                disabled={isPostLikeLoading}
                aria-label={isLiked ? 'Unlike post' : 'Like post'}
                aria-pressed={isLiked}
              >
                {isLiked ? <HeartFilled color={'#ED4956'} /> : <HeartOutline color={'white'} />}
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
                placeholder={'Add a Comment...'}
                className={s.input}
                maxLength={commentMaxLength}
              />
              <Button
                variant={'text'}
                type={'submit'}
                className={s.publishButton}
                disabled={!watchComment('comment')?.trim() || isPublishingComment}
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