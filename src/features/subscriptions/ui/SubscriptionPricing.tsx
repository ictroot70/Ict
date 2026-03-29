'use client'

import { useEffect, useState } from 'react'

import { Card, Typography, Button } from '@/shared/ui'

import styles from './SubscriptionPricing.module.scss'

import { SubscriptionPlan } from '../model/types'
import { SubscriptionPlanValue } from '@/features/profile/settings/model/types'

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
  isPaymentLocked = false
}: SubscriptionPricingProps) {
  const [internalSelectedPlanValue, setInternalSelectedPlanValue] = useState<SubscriptionPlanValue>(
    externalSelectedPlan || plans[0]?.value || 'month'
  )

  useEffect(() => {
    if (externalSelectedPlan) {
      setInternalSelectedPlanValue(externalSelectedPlan)
    }
  }, [externalSelectedPlan])

  const selectedPlanValue = externalSelectedPlan !== undefined
    ? externalSelectedPlan
    : internalSelectedPlanValue

  const selectedPlanData = plans.find(p => p.value === selectedPlanValue)

  const handlePlanChange = (planValue: SubscriptionPlanValue) => {
    if (onPlanChange) {
      onPlanChange(planValue)
    } else {
      setInternalSelectedPlanValue(planValue)
    }
  }

  const isDisabled = isPaymentLocked || !selectedPlanData

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
        Изменить подписку:
      </Typography>

      <div className={styles.pricingList}>
        <Card className={styles.pricingCard}>
          <div className={styles.pricingCard__content}>
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`${styles.planRow} ${selectedPlanValue === plan.value ? styles.planRowSelected : ''}`}
                onClick={() => handlePlanChange(plan.value)}
                role={'button'}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handlePlanChange(plan.value)
                  }
                }}
              >
                <div className={styles.planRadio}>
                  <div
                    className={`${styles.planRadio__circle} ${selectedPlanValue === plan.value ? styles.planRadio__circleSelected : ''}`}
                  >
                    {selectedPlanValue === plan.value && <div className={styles.planRadio__dot} />}
                  </div>
                  <Typography variant={'regular_16'} className={styles.planRadio__label}>
                    {plan.label}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.paymentContainer}>
        <div className={styles.paymentWrapper}>
          <Button
            className={styles.paymentButton}
            onClick={onPayPalClick}
            disabled={isDisabled}
            variant={'outlined'}
          >
            <img src={'/paypal.svg'} alt={'PayPal'} className={styles.paymentIcon} />
          </Button>

          <span className={styles.paymentOr}>Или</span>

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