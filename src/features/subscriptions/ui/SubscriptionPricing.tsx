'use client'

import React, { ReactNode } from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { Loading } from '@/shared/composites'
import { formatDate } from '@/shared/lib/formatters'
import { Button, Card, CheckboxRadix, Typography } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from './SubscriptionPricing.module.scss'

type SubscriptionPricingProps = {
  accountTypeSlot?: ReactNode
  changeSubscriptionSlot?: ReactNode
}

export function SubscriptionPricing({
  accountTypeSlot,
  changeSubscriptionSlot,
}: SubscriptionPricingProps = {}) {
  const {
    subscriptions,
    hasAutoRenewal,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    refetchCurrentSubscription,
    toggleAutoRenewal,
    isToggleLoading,
    isToggleDisabled,
    hasQueueInvariantViolation,
  } = useCurrentSubscriptionChain()

  const hasActiveSubscriptions = subscriptions.length > 0
  const shouldShowCurrentSubscription = hasActiveSubscriptions
  const isInitialLoading = isSubscriptionsLoading && !subscriptions.length

  const visibleSubscriptions = subscriptions

  const resolveNextPaymentDate = (subscriptionIndex: number) => {
    const current = subscriptions[subscriptionIndex]
    const next = subscriptions[subscriptionIndex + 1]

    if (next) {
      // "Next payment" should never be earlier than current period expiration.
      // If the next subscription was paid in advance, we show the next charge moment
      // at the current period boundary instead of a past payment date.
      const currentEndTime = new Date(current.endDateOfSubscription).getTime()
      const nextPaymentTime = new Date(next.dateOfPayment).getTime()
      const normalizedTime = Math.max(currentEndTime, nextPaymentTime)

      return formatDate(new Date(normalizedTime).toISOString())
    }

    if (hasAutoRenewal) {
      return formatDate(current.endDateOfSubscription)
    }

    return '—'
  }

  if (isInitialLoading) {
    return <Loading />
  }

  if (isSubscriptionsError) {
    return (
      <Card className={styles.stateCard}>
        <Typography variant={'h3'}>Could not load subscriptions data</Typography>
        <Typography className={styles.stateText} variant={'regular_16'}>
          Please try again.
        </Typography>
        <Button
          className={styles.retryButton}
          variant={'outlined'}
          onClick={() => void refetchCurrentSubscription()}
        >
          Retry
        </Button>
      </Card>
    )
  }

  const resolvedAccountTypeSlot = accountTypeSlot ?? (
    <div className={styles.integrationSlot} data-slot={'account-type'} />
  )
  const resolvedChangeSubscriptionSlot = changeSubscriptionSlot ?? (
    <div className={styles.integrationSlot} data-slot={'change-subscription'} />
  )

  return (
    <div className={styles.root}>
      {shouldShowCurrentSubscription && (
        <section className={styles.currentSubscriptionSection}>
          <Typography variant={'h3'}>Current Subscription:</Typography>
          <Card className={styles.currentSubscriptionCard}>
            <div className={styles.currentSubscriptionTable}>
              <div className={styles.currentSubscriptionHeader}>
                <Typography className={styles.metricLabel} variant={'regular_14'}>
                  Expire at
                </Typography>
                <Typography className={styles.metricLabel} variant={'regular_14'}>
                  Next payment
                </Typography>
              </div>
              <div className={styles.currentSubscriptionBody}>
                {visibleSubscriptions.map((subscription, index) => (
                  <div
                    key={subscription.subscriptionId}
                    className={clsx(
                      styles.currentSubscriptionRow,
                      index === 0 && styles.currentSubscriptionRowActive,
                      subscription.autoRenewal && styles.currentSubscriptionRowAutoRenew
                    )}
                  >
                    <Typography variant={'semibold_small_text'}>
                      {formatDate(subscription.endDateOfSubscription)}
                    </Typography>
                    <div className={styles.metricCell}>
                      <Typography variant={'semibold_small_text'}>
                        {resolveNextPaymentDate(index)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className={styles.autoRenewalControl}>
            <CheckboxRadix
              required={false}
              label={'Auto-Renewal'}
              checked={hasAutoRenewal}
              disabled={isToggleDisabled}
              onCheckedChange={() => void toggleAutoRenewal()}
            />
            {isToggleLoading && (
              <span
                className={styles.autoRenewalSpinner}
                aria-label={'Updating auto-renewal'}
                role={'status'}
              />
            )}
          </div>
        </section>
      )}

      <section
        className={clsx(
          styles.accountTypeSection,
          !shouldShowCurrentSubscription && styles.accountTypeSectionTopOffset
        )}
      >
        <Typography variant={'h3'}>Account type:</Typography>
        {resolvedAccountTypeSlot}
      </section>

      <section className={styles.businessPricingSection}>
        <Typography variant={'h3'}>Change your subscription:</Typography>
        {resolvedChangeSubscriptionSlot}
      </section>

      {shouldShowCurrentSubscription && hasQueueInvariantViolation && (
        <Typography className={styles.warningText} variant={'small_text'}>
          Queue invariant violated: auto-renew must be enabled only on the last subscription.
        </Typography>
      )}
    </div>
  )
}
