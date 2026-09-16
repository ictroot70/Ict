'use client'
import { Skeleton } from '@/shared/composites'

import s from './HeaderSkeleton.module.scss'

export const HeaderSkeleton = () => {
  return (
    <div className={s.notificationSkeletonSlot} aria-hidden>
      <Skeleton className={s.notificationSkeleton} />
    </div>
  )
}
