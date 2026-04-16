'use client'

import React, { type ReactNode, useEffect, useState } from 'react'

import { Button, Card, Typography } from '@/shared/ui'
import { RadioGroupRadix } from '@ictroot/ui-kit'

import styles from './SubscriptionPricing.module.scss'

import { SubscriptionPlan, SubscriptionPlanValue } from '../model/payments.types'
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

  useEffect(() => {
    if (externalSelectedPlan) {
      setInternalSelectedPlanValue(externalSelectedPlan)
    }
  }, [externalSelectedPlan])

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

  return (
    <div className={styles.root}>
      <SubscriptionCurrentSection>
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
      </SubscriptionCurrentSection>
    </div>
  )
}
