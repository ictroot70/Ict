'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { Loading } from '@/shared/composites'
import { formatDate } from '@/shared/lib/formatters'
import { Button, Card, Typography } from '@/shared/ui'
import { RadioGroupRadix } from '@ictroot/ui-kit'

import styles from './SubscriptionPricing.module.scss'

import { SubscriptionPlan, SubscriptionPlanValue } from '../model/types'
import { SubscriptionCurrentSection } from './SubscriptionCurrentSection'

interface SubscriptionPricingProps {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
  accountTypeSlot?: ReactNode
}

export function SubscriptionPricing({
  plans,
  selectedPlan: externalSelectedPlan,
  onPlanChange,
  onStripeClick,
  isPaymentLocked = false,
  accountTypeSlot,
}: SubscriptionPricingProps) {
  const [internalSelectedPlanValue, setInternalSelectedPlanValue] = useState<SubscriptionPlanValue>(
    externalSelectedPlan || plans[0]?.value || 'month'
  )

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

  const visibleSubscriptions = subscriptions

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

    const autoRenewalIndex = visibleSubscriptions.findIndex(
      subscription => subscription.autoRenewal
    )

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
  }, [hasAutoRenewal, visibleSubscriptions])

  useEffect(() => {
    if (isSubscriptionsError) {
      hadSubscriptionErrorRef.current = true

      return
    }

    if (!isSubscriptionsFetching) {
      hadSubscriptionErrorRef.current = false
    }
  }, [isSubscriptionsError, isSubscriptionsFetching])

  useEffect(() => {
    if (externalSelectedPlan) {
      setInternalSelectedPlanValue(externalSelectedPlan)
    }
  }, [externalSelectedPlan])

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

  const selectedPlanValue =
    externalSelectedPlan !== undefined ? externalSelectedPlan : internalSelectedPlanValue

  const selectedPlanData = plans.find(plan => plan.value === selectedPlanValue)
  const isDisabled = isPaymentLocked || !selectedPlanData || !plans.length

  const radioOptions = plans.map(plan => ({
    value: plan.value,
    label: plan.label,
    id: `plan-${plan.id}`,
  }))

  const handleValueChange = (value: string) => {
    const planValue = value as SubscriptionPlanValue

    if (onPlanChange) {
      onPlanChange(planValue)

      return
    }

    setInternalSelectedPlanValue(planValue)
  }

  if (isInitialLoading) {
    return <Loading />
  }

  return (
    <div className={styles.root}>
      <SubscriptionCurrentSection
        shouldShowCurrentSubscriptionSection={shouldShowCurrentSubscriptionSection}
        shouldShowCurrentSubscriptionFallback={shouldShowCurrentSubscriptionFallback}
        isSubscriptionsFetching={isSubscriptionsFetching}
        refetchCurrentSubscription={refetchCurrentSubscription}
        currentSubscriptionScrollAreaHostRef={currentSubscriptionScrollAreaHostRef}
        currentSubscriptionBodyRef={currentSubscriptionBodyRef}
        subscriptionRowRefs={subscriptionRowRefs}
        visibleSubscriptions={visibleSubscriptions}
        resolveNextPaymentDate={resolveNextPaymentDate}
        hasAutoRenewal={hasAutoRenewal}
        isToggleDisabled={isToggleDisabled}
        toggleAutoRenewal={toggleAutoRenewal}
        isToggleLoading={isToggleLoading}
      />

      {accountTypeSlot}

      <section className={styles.section}>
        <Typography variant={'h3'} className={styles.section__title}>
          Change your subscription:
        </Typography>

        {!plans.length ? (
          <Card className={styles.stateCard}>
            <Typography variant={'h3'}>No plans available</Typography>
            <Typography className={styles.stateText} variant={'regular_16'}>
              Pricing data is temporarily unavailable.
            </Typography>
          </Card>
        ) : (
          <>
            <div className={styles.pricingList}>
              <Card className={styles.pricingCard}>
                <RadioGroupRadix
                  label={'Select subscription plan'}
                  options={radioOptions}
                  value={selectedPlanValue}
                  onValueChange={handleValueChange}
                  orientation={'vertical'}
                  disabled={isPaymentLocked}
                />
              </Card>
            </div>

            <div className={styles.paymentContainer}>
              <div className={styles.paymentWrapper}>
                <Button
                  className={styles.paymentButton}
                  onClick={onStripeClick}
                  disabled={isDisabled}
                  variant={'outlined'}
                >
                  <img src={'/stripe.svg'} alt={'Stripe'} className={styles.paymentIcon} />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
