'use client'

import React, { type ReactNode, useEffect, useRef } from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { Loading } from '@/shared/composites'
import { formatDate } from '@/shared/lib/formatters'
import { Button, Card, CheckboxRadix, ScrollAreaRadix, Typography } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from './SubscriptionPricing.module.scss'

type Props = {
  children: ReactNode
}

export const SubscriptionCurrentSection = ({ children }: Props) => {
  const {
    subscriptions,
    hasAutoRenewal,
    isLoading: isSubscriptionsLoading,
    isFetching: isSubscriptionsFetching,
    isError: isSubscriptionsError,
    refetchCurrentSubscription,
    toggleAutoRenewal,
    isToggleLoading,
    isToggleDisabled,
  } = useCurrentSubscriptionChain()

  const hasActiveSubscriptions = subscriptions.length > 0
  const isInitialLoading = isSubscriptionsLoading && !subscriptions.length
  const currentSubscriptionScrollAreaHostRef = useRef<HTMLDivElement | null>(null)
  const currentSubscriptionBodyRef = useRef<HTMLDivElement | null>(null)
  const subscriptionRowRefs = useRef<Array<HTMLDivElement | null>>([])
  const prevHasAutoRenewalRef = useRef(hasAutoRenewal)
  const hadSubscriptionErrorRef = useRef(isSubscriptionsError)

  useEffect(() => {
    const wasAutoRenewalEnabled = prevHasAutoRenewalRef.current

    prevHasAutoRenewalRef.current = hasAutoRenewal

    if (wasAutoRenewalEnabled || !hasAutoRenewal) {
      return
    }

    const viewportNode =
      currentSubscriptionScrollAreaHostRef.current?.querySelector<HTMLDivElement>(
        `.${styles.currentSubscriptionViewport}`
      ) ?? currentSubscriptionBodyRef.current

    if (!viewportNode) {
      return
    }

    const autoRenewalIndex = subscriptions.findIndex(subscription => subscription.autoRenewal)

    if (autoRenewalIndex < 0) {
      return
    }

    const targetRow = subscriptionRowRefs.current[autoRenewalIndex]

    if (!targetRow) {
      return
    }

    const currentScrollTop = viewportNode.scrollTop
    const currentScrollBottom = currentScrollTop + viewportNode.clientHeight
    const rowTop = targetRow.offsetTop
    const rowBottom = rowTop + targetRow.offsetHeight
    const isRowFullyVisible = rowTop >= currentScrollTop && rowBottom <= currentScrollBottom

    if (isRowFullyVisible) {
      return
    }

    targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [hasAutoRenewal, subscriptions])

  useEffect(() => {
    if (isSubscriptionsError) {
      hadSubscriptionErrorRef.current = true

      return
    }

    if (!isSubscriptionsFetching) {
      hadSubscriptionErrorRef.current = false
    }
  }, [isSubscriptionsError, isSubscriptionsFetching])

  const resolveNextPaymentDate = (subscriptionIndex: number) => {
    const current = subscriptions[subscriptionIndex]
    const next = subscriptions[subscriptionIndex + 1]

    if (next) {
      // Next payment should not be earlier than current period expiration.
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

  const shouldKeepFallbackDuringRetry = isSubscriptionsFetching && hadSubscriptionErrorRef.current
  const shouldShowCurrentSubscriptionFallback =
    isSubscriptionsError || shouldKeepFallbackDuringRetry
  const shouldShowCurrentSubscriptionSection =
    hasActiveSubscriptions || shouldShowCurrentSubscriptionFallback

  if (isInitialLoading) {
    return <Loading />
  }

  return (
    <>
      {shouldShowCurrentSubscriptionSection && (
        <section className={styles.currentSubscriptionSection}>
          <Typography variant={'h3'}>Current Subscription:</Typography>
          {shouldShowCurrentSubscriptionFallback ? (
            <Card className={styles.stateCard}>
              <Typography variant={'h3'}>Could not load subscriptions data</Typography>
              <Typography className={styles.stateText} variant={'regular_16'}>
                Please try again.
              </Typography>
              <Button
                className={styles.retryButton}
                variant={'outlined'}
                disabled={isSubscriptionsFetching}
                onClick={() => void refetchCurrentSubscription()}
              >
                Retry
              </Button>
            </Card>
          ) : (
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
                <div
                  ref={currentSubscriptionScrollAreaHostRef}
                  className={styles.currentSubscriptionScrollAreaHost}
                >
                  <ScrollAreaRadix
                    className={styles.currentSubscriptionScrollArea}
                    viewportClassName={styles.currentSubscriptionViewport}
                  >
                    <div
                      ref={currentSubscriptionBodyRef}
                      className={styles.currentSubscriptionBody}
                      data-testid={'current-subscription-body'}
                    >
                      {subscriptions.map((subscription, index) => (
                        <div
                          key={subscription.subscriptionId}
                          ref={node => {
                            subscriptionRowRefs.current[index] = node
                          }}
                          data-subscription-id={subscription.subscriptionId}
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
                  </ScrollAreaRadix>
                </div>
              </div>
            </Card>
          )}

          <div className={styles.autoRenewalControl}>
            <CheckboxRadix
              required={false}
              label={'Auto-Renewal'}
              checked={hasAutoRenewal}
              disabled={isToggleDisabled || shouldShowCurrentSubscriptionFallback}
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

      {children}
    </>
  )
}
