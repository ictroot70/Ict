'use client'

import { useMemo } from 'react'

import { useGetPricingQuery } from '@/features/subscriptions/api'
import { mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { Loading } from '@/shared/composites'
import { SubscriptionType } from '@/shared/types'
import { Button, Card, Typography } from '@/shared/ui'

import styles from './SubscriptionPricing.module.scss'

const SUBSCRIPTION_ORDER: Record<SubscriptionType, number> = {
  [SubscriptionType.DAY]: 0,
  [SubscriptionType.WEEKLY]: 1,
  [SubscriptionType.MONTHLY]: 2,
}

export function SubscriptionPricing() {
  const { data, isError, isLoading, refetch } = useGetPricingQuery()

  const pricingPlans = useMemo(() => {
    if (!data) {
      return null
    }

    return [...data.data].sort(
      (left, right) =>
        SUBSCRIPTION_ORDER[left.typeDescription] - SUBSCRIPTION_ORDER[right.typeDescription]
    )
  }, [data])

  if (isLoading) {
    return (
      <Card className={styles.stateCard}>
        <div className={styles.loadingState}>
          <Loading size={8} />
        </div>
        <Typography variant={'regular_16'}>Loading pricing...</Typography>
      </Card>
    )
  }

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

  if (!pricingPlans || !pricingPlans.length) {
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
      <Typography variant={'h3'}>Subscription plans</Typography>
      <div className={styles.grid}>
        {pricingPlans.map(plan => (
          <Card key={plan.typeDescription} className={styles.card}>
            <Typography variant={'regular_16'}>
              {mapSubscriptionTypeToLabel(plan.typeDescription)}
            </Typography>
            <Typography className={styles.amount} variant={'h2'}>
              {plan.amount}
            </Typography>
            <Typography className={styles.hint} variant={'small_text'}>
              API pricing
            </Typography>
          </Card>
        ))}
      </div>
    </div>
  )
}
