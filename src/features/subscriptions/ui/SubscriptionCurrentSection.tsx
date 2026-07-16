'use client'

import React, { type RefObject } from 'react'

import { formatDate } from '@/shared/lib/formatters'
import { Button, Card, CheckboxRadix, ScrollAreaRadix, Typography } from '@/shared/ui'
import { clsx } from 'clsx'

import styles from './SubscriptionPricing.module.scss'

type SubscriptionItem = {
  subscriptionId: string
  dateOfPayment: string
  endDateOfSubscription: string
  autoRenewal: boolean
}

type Props = {
  shouldShowCurrentSubscriptionSection: boolean
  shouldShowCurrentSubscriptionFallback: boolean
  isSubscriptionsFetching: boolean
  refetchCurrentSubscription: () => Promise<unknown>
  currentSubscriptionScrollAreaHostRef: RefObject<HTMLDivElement | null>
  currentSubscriptionBodyRef: RefObject<HTMLDivElement | null>
  subscriptionRowRefs: RefObject<Array<HTMLDivElement | null>>
  visibleSubscriptions: SubscriptionItem[]
  resolveNextPaymentDate: (subscriptionIndex: number) => string
  hasAutoRenewal: boolean
  isToggleDisabled: boolean
  toggleAutoRenewal: () => Promise<void>
  isToggleLoading: boolean
}

export const SubscriptionCurrentSection = ({
  shouldShowCurrentSubscriptionSection,
  shouldShowCurrentSubscriptionFallback,
  isSubscriptionsFetching,
  refetchCurrentSubscription,
  currentSubscriptionScrollAreaHostRef,
  currentSubscriptionBodyRef,
  subscriptionRowRefs,
  visibleSubscriptions,
  resolveNextPaymentDate,
  hasAutoRenewal,
  isToggleDisabled,
  toggleAutoRenewal,
  isToggleLoading,
}: Props) => {
  if (!shouldShowCurrentSubscriptionSection) {
    return null
  }

  return (
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
                  {visibleSubscriptions.map((subscription, index) => (
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
  )
}
