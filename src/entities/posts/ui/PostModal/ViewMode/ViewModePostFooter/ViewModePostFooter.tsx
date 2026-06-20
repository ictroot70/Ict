import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { ControlledInput } from '@/features/formControls'
import { Avatar, Skeleton } from '@/shared/composites'
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

import { RenderPostLikeAction } from '../../postModalLikeAction.types'

interface PostFooterProps {
  variant: 'public' | 'myPost' | 'userPost'
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
  handlePublish: (data: CommentFormData) => void
  isAuthLoading: boolean
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
}: PostFooterProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const visibleLikeAvatars = avatarWhoLikes.filter(Boolean).slice(0, 3)

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
                <Button variant={'text'} className={s.postButton}>
                  <HeartOutline color={'white'} />
                </Button>
              )}
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
          {likesCount} <strong>&#34;Like&#34;</strong>
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
