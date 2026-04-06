'use client'

import { Fragment, ReactNode, useState } from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { Loading } from '@/shared/composites'
import { formatDate } from '@/shared/lib/formatters'
import { Button, Card, CheckboxRadix, Typography } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from './SubscriptionPricing.module.scss'

const INITIAL_VISIBLE_FUTURE_SUBSCRIPTIONS = 2

type SubscriptionPricingProps = {
  // Integration contract for Sprint 6 composition (T3/T4/T0):
  // parent container can inject final blocks here without touching T4 logic.
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

  const [isFutureExpanded, setIsFutureExpanded] = useState(false)
  const currentSubscription = subscriptions[0]
  const futureSubscriptions = subscriptions.slice(1)
  const visibleFutureSubscriptions = isFutureExpanded
    ? futureSubscriptions
    : futureSubscriptions.slice(0, INITIAL_VISIBLE_FUTURE_SUBSCRIPTIONS)
  const hiddenFutureCount = futureSubscriptions.length - visibleFutureSubscriptions.length
  const visibleSubscriptions = currentSubscription
    ? [currentSubscription, ...visibleFutureSubscriptions]
    : []

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
                  <Fragment key={subscription.subscriptionId}>
                    {index === 1 && (
                      <div className={styles.nextGroupDivider}>
                        <Typography className={styles.nextGroupLabel} variant={'regular_14'}>
                          Next subscriptions
                        </Typography>
                      </div>
                    )}
                    <div
                      className={clsx(
                        styles.currentSubscriptionRow,
                        index === 0 && styles.currentSubscriptionRowActive,
                        isToggleLoading && styles.currentSubscriptionRowPending
                      )}
                    >
                      <Typography variant={'semibold_small_text'}>
                        {formatDate(subscription.endDateOfSubscription)}
                      </Typography>
                      <div className={styles.metricCell}>
                        <Typography variant={'semibold_small_text'}>
                          {subscriptions[index + 1]
                            ? formatDate(subscriptions[index + 1].dateOfPayment)
                            : '—'}
                        </Typography>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
              {futureSubscriptions.length > INITIAL_VISIBLE_FUTURE_SUBSCRIPTIONS && (
                <Button
                  className={styles.showMoreButton}
                  variant={'text'}
                  onClick={() => setIsFutureExpanded(prev => !prev)}
                >
                  {hiddenFutureCount > 0 ? `Show more (${hiddenFutureCount})` : 'Show less'}
                </Button>
              )}
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
