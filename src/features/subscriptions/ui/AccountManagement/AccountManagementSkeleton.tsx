import { Skeleton } from '@/shared/composites'

import styles from './AccountManagement.module.scss'

export function AccountManagementSkeleton() {
  return (
    <div className={styles.accountManagementPage} aria-label={'Loading account management'}>
      <div className={styles.skeletonAccountType}>
        <Skeleton className={styles.skeletonTitle} />
        <div className={styles.skeletonTabs}>
          <Skeleton className={styles.skeletonTab} />
          <Skeleton className={styles.skeletonTab} />
        </div>
      </div>

      <div className={styles.skeletonSection}>
        <Skeleton className={styles.skeletonTitle} />
        <div className={styles.skeletonCard}>
          <Skeleton className={styles.skeletonRow} />
          <Skeleton className={styles.skeletonRow} />
          <Skeleton className={styles.skeletonRowShort} />
        </div>
      </div>
    </div>
  )
}
