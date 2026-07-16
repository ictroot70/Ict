import { Skeleton } from '@/shared/composites'

import s from './PostModal.module.scss'

export function PostModalSkeleton() {
  return (
    <div className={s.skeletonModal} aria-label={'Loading post'}>
      <Skeleton className={s.skeletonPhoto} />

      <div className={s.skeletonSideBar}>
        <div className={s.skeletonHeader}>
          <Skeleton className={s.skeletonAvatar} />
          <Skeleton className={s.skeletonUserName} />
          <Skeleton className={s.skeletonAction} />
        </div>

        <div className={s.skeletonComments}>
          {Array.from({ length: 4 }, (_, index) => (
            <div className={s.skeletonComment} key={index}>
              <Skeleton className={s.skeletonCommentAvatar} />
              <div className={s.skeletonCommentBody}>
                <Skeleton className={s.skeletonCommentLine} />
                <Skeleton className={s.skeletonCommentMeta} />
              </div>
            </div>
          ))}
        </div>

        <div className={s.skeletonFooter}>
          <div className={s.skeletonFooterActions}>
            <Skeleton className={s.skeletonIcon} />
            <Skeleton className={s.skeletonIcon} />
            <Skeleton className={s.skeletonIcon} />
            <Skeleton className={`${s.skeletonIcon} ${s.skeletonSaveIcon}`} />
          </div>

          <div className={s.skeletonLikesRow}>
            <div className={s.skeletonLikesAvatars}>
              <Skeleton className={s.skeletonLikeAvatar} />
              <Skeleton className={`${s.skeletonLikeAvatar} ${s.skeletonLikeAvatarOverlap}`} />
              <Skeleton className={`${s.skeletonLikeAvatar} ${s.skeletonLikeAvatarOverlap}`} />
            </div>
            <Skeleton className={s.skeletonLikesCount} />
          </div>

          <Skeleton className={s.skeletonTimestamp} />

          <div className={s.skeletonSeparator} />

          <div className={s.skeletonInputForm}>
            <Skeleton className={s.skeletonInput} />
            <Skeleton className={s.skeletonPublish} />
          </div>
        </div>
      </div>
    </div>
  )
}
