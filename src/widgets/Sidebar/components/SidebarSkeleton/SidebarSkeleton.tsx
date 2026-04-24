'use client'

import { Skeleton } from '@/shared/composites/Skeleton'

import s from './SidebarSkeleton.module.scss'

const PRIMARY_ITEMS_COUNT = 5
const SECONDARY_ITEMS_COUNT = 2

export const SidebarSkeleton = () => {
  return (
    <aside className={s.sidebarPlaceholder} aria-hidden>
      <div className={s.sidebarPlaceholderContent}>
        <div className={s.sidebarSkeletonGroup}>
          {Array.from({ length: PRIMARY_ITEMS_COUNT }).map((_, index) => (
            <div key={`primary-${index}`} className={s.sidebarSkeletonItem}>
              <Skeleton className={s.sidebarSkeletonIcon} />
              <Skeleton className={s.sidebarSkeletonLabel} />
            </div>
          ))}
        </div>

        <div className={s.sidebarSkeletonGroup}>
          {Array.from({ length: SECONDARY_ITEMS_COUNT }).map((_, index) => (
            <div key={`secondary-${index}`} className={s.sidebarSkeletonItem}>
              <Skeleton className={s.sidebarSkeletonIcon} />
              <Skeleton className={s.sidebarSkeletonLabel} />
            </div>
          ))}
        </div>

        <div className={s.sidebarSkeletonLogout}>
          <Skeleton className={s.sidebarSkeletonIcon} />
          <Skeleton className={s.sidebarSkeletonLabel} />
        </div>
      </div>
    </aside>
  )
}
