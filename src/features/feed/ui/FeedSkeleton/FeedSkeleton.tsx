import { Skeleton } from '@/shared/composites'

import s from './FeedSkeleton.module.scss'

const SKELETON_POSTS = 3
const DESCRIPTION_VARIANTS = [
  s.descriptionTextLong,
  s.descriptionTextMedium,
  s.descriptionTextShort,
]

export function FeedSkeleton() {
  return (
    <div className={s.list} aria-label={'Loading feed'}>
      {Array.from({ length: SKELETON_POSTS }, (_, index) => {
        const descriptionVariant = DESCRIPTION_VARIANTS[index % DESCRIPTION_VARIANTS.length]

        return (
          <article className={s.post} key={index}>
            <header className={s.header}>
              <Skeleton className={s.avatar} />
              <Skeleton className={s.author} />
              <Skeleton className={s.separator} />
              <Skeleton className={s.time} />
              <Skeleton className={s.menu} />
            </header>
            <Skeleton className={s.media} />
            <div className={s.footer}>
              <div className={s.actions}>
                <Skeleton className={s.icon} />
                <Skeleton className={s.icon} />
                <Skeleton className={s.icon} />
                <Skeleton className={`${s.icon} ${s.saveIcon}`} />
              </div>

              <div className={s.descriptionRow}>
                <Skeleton className={s.descriptionAvatar} />
                <div className={`${s.descriptionText} ${descriptionVariant}`}>
                  <Skeleton className={s.descriptionLine} />
                  <Skeleton className={s.descriptionLineShort} />
                </div>
              </div>

              <div className={s.likesRow}>
                <Skeleton className={s.likesText} />
              </div>

              <Skeleton className={s.commentsToggle} />

              <div className={s.commentForm}>
                <div className={s.commentInputWrapper}>
                  <Skeleton className={s.commentInput} />
                </div>
                <Skeleton className={s.publishButton} />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
