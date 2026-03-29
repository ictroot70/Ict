import React, { useState } from 'react'

import {
  useCancelAutoRenewalMutation,
  useRenewAutoRenewalMutation,
} from '@/features/subscriptions/api'

import { UISubscription } from '@/features/profile/settings/model/types'
import { Card, CheckboxRadix, Typography } from '@/shared/ui'

import styles from './SubscriptionSection.module.scss'

interface Props {
  subscription?: UISubscription
}

export const SubscriptionSection: React.FC<Props> = ({ subscription }) => {
  const [cancelAutoRenewal] = useCancelAutoRenewalMutation()
  const [renewAutoRenewal] = useRenewAutoRenewalMutation()

  const [autoRenewal, setAutoRenewal] = useState(subscription?.autoRenewal ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  if (!subscription) {
    return (
      <section className={styles.section}>
        <Typography variant={'h3'} className={styles.section__title}>
          {/* ✅ i18n */}
          {t('subscription.current')}
        </Typography>
        <div className={styles.subscriptionsList}>
          <Card className={styles.subscriptionCard}>
            <Typography variant={'regular_14'}>
              {/* ✅ i18n */}
              {t('subscription.no_active')}
            </Typography>
          </Card>
        </div>
      </section>
    )
  }

  const handleAutoRenewalChange = async (checked: boolean) => {
    if (isUpdating) {
      return
    }

    setIsUpdating(true)

    try {
      if (checked) {
        await renewAutoRenewal().unwrap()
      } else {
        await cancelAutoRenewal().unwrap()
      }
      setAutoRenewal(checked)
    } catch (error) {
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>

        {t('subscription.current')}
      </Typography>

      <div className={styles.subscriptionsList}>
        <Card
          className={`${styles.subscriptionCard} ${!subscription.isActive ? styles.subscriptionCardInactive : ''}`}
        >
          <div className={styles.subscriptionCard__fields}>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>

                {t('subscription.expire_at')}
              </Typography>
              <Typography variant={'bold_14'} className={styles.subscriptionField__date}>
                {subscription.expireDate}
              </Typography>
            </div>
            <div className={styles.subscriptionField}>
              <Typography variant={'regular_14'} className={styles.subscriptionField__label}>

                {t('subscription.next_payment')}
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
          label={t('subscription.auto_renewal')}
          disabled={isUpdating}
        />
      </div>
    </section>
  )
}