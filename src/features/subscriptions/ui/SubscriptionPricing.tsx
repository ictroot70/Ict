'use client'

import { useMemo } from 'react'

import { useGetPricingQuery } from '@/features/subscriptions/api'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { SubscriptionType } from '@/shared/types'
import { Button, Card, Typography } from '@/shared/ui'

import styles from './SubscriptionPricing.module.scss'

const SUBSCRIPTION_ORDER: Record<SubscriptionType, number> = {
  [SubscriptionType.DAY]: 0,
  [SubscriptionType.WEEKLY]: 1,
  [SubscriptionType.MONTHLY]: 2,
}

export function SubscriptionPricing() {
  const { data, isError, refetch } = useGetPricingQuery()

  const pricingPlans = useMemo(() => {
    if (!data) {
      return []
    }

    return [...data.data].sort(
      (left, right) =>
        SUBSCRIPTION_ORDER[left.typeDescription] - SUBSCRIPTION_ORDER[right.typeDescription]
    )
  }, [data])

  if (isError) {
    return (
      <Card className={styles.stateCard}>
        <Typography variant={'h3'}>Could not load pricing</Typography>
        <Typography className={styles.stateText} variant={'regular_16'}>
          Please try again.
        </Typography>
        <Button className={styles.retryButton} variant={'outlined'} onClick={() => refetch()}>
          Retry
        </Button>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  if (!pricingPlans.length) {
    return (
      <Card className={styles.stateCard}>
        <Typography variant={'h3'}>No pricing plans</Typography>
        <Typography className={styles.stateText} variant={'regular_16'}>
          Pricing is currently unavailable.
        </Typography>
      </Card>
    )
  }

  return (
    <div className={styles.root}>
      <Typography variant={'h3'}>Change your subscription:</Typography>
      <Card className={styles.noticeCard}>
        <Typography className={styles.noticeTitle} variant={'regular_16'}>
          Temporary pricing preview
        </Typography>
        <Typography className={styles.noticeText} variant={'small_text'}>
          Plans below are rendered from `useGetPricingQuery`.
        </Typography>
        <Typography className={styles.noticeText} variant={'small_text'}>
          Next step for Account Management flow (T2+): connect selected plan with
          `createSubscription` and subscription state from `getCurrentSubscription`.
        </Typography>
      </Card>
      <Card className={styles.pricingCard}>
        <div className={styles.pricingList}>
          {pricingPlans.map((plan, index) => (
            <div key={plan.typeDescription} className={styles.planRow}>
              <span
                aria-hidden
                className={index === 0 ? styles.pseudoRadioSelected : styles.pseudoRadio}
              />
              <Typography variant={'regular_16'}>
                ${plan.amount} per {mapSubscriptionTypeToLabel(plan.typeDescription)}
              </Typography>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
