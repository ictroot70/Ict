import { Avatar, Skeleton } from '@/shared/composites'
import { PostModalData } from '@/shared/types'
import { Button, Typography, BookmarkOutline, PaperPlane } from '@/shared/ui'

import s from '../../ViewMode.module.scss'

interface ViewModePostActionsProps {
  variant: 'public' | 'myPost' | 'userPost'
  postData: Pick<PostModalData, 'likesCount' | 'avatarWhoLikes'>
  formattedCreatedAt: string
  isAuthLoading: boolean
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
}: ViewModePostActionsProps) => {
  const shouldShowAuthActions = variant !== 'public'
  const shouldShowAuthSkeleton = isAuthLoading
  const { likesCount, avatarWhoLikes } = postData
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
              <Button variant={'text'} className={s.postButton} aria-label={'Share post'}>
                <PaperPlane color={'var(--color-light-100)'} />
              </Button>
              <Button variant={'text'} className={s.postButton} aria-label={'Save post'}>
                <BookmarkOutline color={'var(--color-light-100)'} />
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
