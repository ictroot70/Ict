import React, { useState } from 'react'
import { UISubscription } from '@/features/profile/settings/model/types'
import { Card, CheckboxRadix, Typography } from '@/shared/ui'
import styles from './SubscriptionSection.module.scss'

interface Props {
  subscription?: UISubscription
}

export const SubscriptionSection: React.FC<Props> = ({ subscription }) => {
  const [autoRenewal, setAutoRenewal] = useState(subscription?.autoRenewal ?? false)

  if (!subscription) {
    return (
      <section className={styles.section}>
        <Typography variant={'h3'} className={styles.section__title}>
          Current Subscription:
        </Typography>
        <div className={styles.subscriptionsList}>
          <Card className={styles.subscriptionCard}>
            <Typography variant={'regular_14'}>No active subscription</Typography>
          </Card>
        </div>
      </section>
    )
  }

  const handleAutoRenewalChange = (checked: boolean) => {
    setAutoRenewal(checked)
  }

  return (
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>
        Current Subscription:
      </Typography>

      <div className={styles.subscriptionsList}>
        <Card
          className={`${styles.subscriptionCard} ${!subscription.isActive ? styles.subscriptionCardInactive : ''}`}
        >
          <div className={styles.subscriptionCard__fields}>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
                Expire at:
              </Typography>
              <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
                {subscription.expireDate}
              </Typography>
            </div>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>
                Next payment:
              </Typography>
              <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
                {subscription.nextPaymentDate}
              </Typography>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.autoRenewalContainer}>
        <CheckboxRadix
          checked={autoRenewal}
          onCheckedChange={handleAutoRenewalChange}
          label={'Auto-Renewal'}
        />
      </div>
    </section>
  )
}
