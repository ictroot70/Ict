
import styles from './BusinessActiveSubscriptionView.module.scss'

import { Subscription, SubscriptionPlan } from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'
import { SubscriptionPlanValue } from '@/features/profile/settings/model/types'


interface BusinessActiveSubscriptionViewProps {
  subscription: Subscription
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export const BusinessActiveSubscriptionView: React.FC<BusinessActiveSubscriptionViewProps> = ({
  subscription,
  plans,
  selectedPlan,
  onPlanChange,
  onPayPalClick,
  onStripeClick,
  isPaymentLocked = false
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