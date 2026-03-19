'use client'

import { useState } from 'react'

import { useCreateSubscriptionMutation } from '@/features/subscriptions/api'
import { PaymentType } from '@/shared/types'
import { Card, Typography, Button } from '@/shared/ui'

import styles from './SubscriptionPricing.module.scss'

import { SubscriptionPlan } from '../model/types'

interface Props {
  plans: SubscriptionPlan[]
  onPayPalClick?: () => void
  onStripeClick?: () => void
}

export function SubscriptionPricing({ plans, onPayPalClick, onStripeClick }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]?.id || '')
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation()

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  const handlePayment = async (paymentType: PaymentType) => {
    if (!selectedPlanData) {
      return
    }

    try {
      const response = await createSubscription({
        typeSubscription: selectedPlanData.period,
        paymentType: paymentType,
        amount: Number(selectedPlanData.price),
        baseUrl: window.location.origin,
      }).unwrap()

      if (response.url) {
        window.location.href = response.url
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
    }
  }

  const handlePayPalClick = async () => {
    if (onPayPalClick) {
      onPayPalClick()
    } else {
      await handlePayment(PaymentType.PAYPAL)
    }
  }

  const handleStripeClick = async () => {
    if (onStripeClick) {
      onStripeClick()
    } else {
      await handlePayment(PaymentType.STRIPE)
    }
  }

  if (!plans.length) {
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
    <section className={styles.section}>
      <Typography variant={'h3'} className={styles.section__title}>
        Change your subscription:
      </Typography>

      <div className={styles.pricingList}>
        <Card className={styles.pricingCard}>
          <div className={styles.pricingCard__content}>
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`${styles.planRow} ${selectedPlan === plan.id ? styles.planRowSelected : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
                role={'button'}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedPlan(plan.id)
                  }
                }}
              >
                <div className={styles.planRadio}>
                  <div
                    className={`${styles.planRadio__circle} ${selectedPlan === plan.id ? styles.planRadio__circleSelected : ''}`}
                  >
                    {selectedPlan === plan.id && <div className={styles.planRadio__dot} />}
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
            onClick={handlePayPalClick}
            disabled={isLoading || !selectedPlanData}
            variant={'outlined'}
          >
            <img src={'/paypal.svg'} alt={'PayPal'} className={styles.paymentIcon} />
          </Button>

          <span className={styles.paymentOr}>Or</span>

          <Button
            className={styles.paymentButton}
            onClick={handleStripeClick}
            disabled={isLoading || !selectedPlanData}
            variant={'outlined'}
          >
            <img src={'/stripe.svg'} alt={'Stripe'} className={styles.paymentIcon} />
          </Button>
        </div>
      </div>
    </section>
  )
}
