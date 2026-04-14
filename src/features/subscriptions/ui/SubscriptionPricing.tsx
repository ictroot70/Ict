'use client'
import { useEffect, useState } from 'react'

import { Card, Typography, Button } from '@/shared/ui'
import { RadioGroupRadix } from '@ictroot/ui-kit'

import styles from './SubscriptionPricing.module.scss'

import { SubscriptionPlan, SubscriptionPlanValue } from '../model/types'

interface SubscriptionPricingProps {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export function SubscriptionPricing({
  plans,
  selectedPlan: externalSelectedPlan,
  onPlanChange,
  onPayPalClick,
  onStripeClick,
  isPaymentLocked = false,
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

  const selectedPlanData = plans.find(p => p.value === selectedPlanValue)
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
    } else {
      setInternalSelectedPlanValue(planValue)
    }
  }

  if (!plans.length) {
    return (
      <Card className={styles.stateCard}>
        <Typography variant={'h3'}>Нет доступных тарифов</Typography>
        <Typography className={styles.stateText} variant={'regular_16'}>
          Информация о тарифах временно недоступна.
        </Typography>
      </Card>
    )
  }

  return (
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>
        Change your subscription:
      </Typography>

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
          {/* <Button
            className={styles.paymentButton}
            onClick={onPayPalClick}
            disabled={isDisabled}
            variant={'outlined'}
          >
            <img src={'/paypal.svg'} alt={'PayPal'} className={styles.paymentIcon} />
          </Button>

          <span className={styles.paymentOr}>Or</span> */}

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
    </section>
  )
}
