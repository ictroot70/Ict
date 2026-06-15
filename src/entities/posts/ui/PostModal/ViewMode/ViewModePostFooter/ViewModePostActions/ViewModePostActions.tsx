import { Avatar, Skeleton } from '@/shared/composites'
import { PostModalData } from '@/shared/types'
import {
  Button,
  Typography,
  BookmarkOutline,
  HeartFilled,
  HeartOutline,
  PaperPlane,
} from '@/shared/ui'

import s from '../../ViewMode.module.scss'

interface ViewModePostActionsProps {
  variant: 'public' | 'myPost' | 'userPost'
  postData: Pick<PostModalData, 'likesCount' | 'isLiked' | 'avatarWhoLikes'>
  formattedCreatedAt: string
  isAuthLoading: boolean
  isPostLikeLoading: boolean
  onTogglePostLike: () => void
}

const formatLikesCount = (count: number): string => {
  if (count === 1) {
    return '1 like'
  }

  return `${count.toLocaleString()} "Like"`
}

export const ViewModePostActions = ({
  variant,
  postData,
  formattedCreatedAt,
  isAuthLoading,
  isPostLikeLoading,
  onTogglePostLike,
}: ViewModePostActionsProps) => {
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
    </div>
  )
}
