import { Skeleton } from '@/shared/composites'
import { Card } from '@/shared/ui'

import styles from './SubscriptionPricing.module.scss'

export function SubscriptionPricingSkeleton() {
  return (
    <div className={styles.root} aria-label={'Loading subscription pricing'}>
      <section className={styles.currentSubscriptionSection}>
        <Skeleton className={styles.skeletonTitle} />
        <Card className={styles.currentSubscriptionCard}>
          <div className={styles.skeletonMetrics}>
            <Skeleton className={styles.skeletonMetric} />
            <Skeleton className={styles.skeletonMetric} />
          </div>
          <Skeleton className={styles.skeletonToggle} />
        </Card>
      </section>

      <section className={styles.section}>
        <Skeleton className={styles.skeletonTitle} />
        <div className={styles.pricingList}>
          <Card className={styles.pricingCard}>
            <div className={styles.skeletonPlanList}>
              <Skeleton className={styles.skeletonPlanRow} />
              <Skeleton className={styles.skeletonPlanRow} />
              <Skeleton className={styles.skeletonPlanRow} />
            </div>
          </Card>
        </div>
        <div className={styles.paymentContainer}>
          <Skeleton className={styles.skeletonPaymentButton} />
        </div>
      </section>
    </div>
  )
}
