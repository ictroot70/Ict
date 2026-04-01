import { FC } from 'react'

import { SubscriptionPlanValue, UISubscriptionPlan } from '@/features/profile/settings/model/types'

import styles from './BusinessNoSubscriptionView.module.scss'

import { SubscriptionPricing } from '../SubscriptionPricing'

interface BusinessNoSubscriptionViewProps {
  plans: UISubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export const BusinessNoSubscriptionView: FC<BusinessNoSubscriptionViewProps> = ({
  plans,
  selectedPlan,
  onPlanChange,
  onPayPalClick,
  onStripeClick,
  isPaymentLocked = false,
}) => {
  return (
    <div className={styles.container}>
      <SubscriptionPricing
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        onPayPalClick={onPayPalClick}
        onStripeClick={onStripeClick}
        isPaymentLocked={isPaymentLocked}
      />
    </div>
  )
}
