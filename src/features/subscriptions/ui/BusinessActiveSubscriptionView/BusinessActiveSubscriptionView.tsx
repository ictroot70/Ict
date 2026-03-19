import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection'
import { SubscriptionType } from '@/shared/types'

import styles from './BusinessActiveSubscriptionView.module.scss'

import { Subscription, SubscriptionPlan } from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'

interface Props {
  subscription: Subscription
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionType
  onPlanChange?: (plan: SubscriptionType) => void
  onStripeClick?: () => void
  onPaypalClick?: () => void
  isPaymentLocked?: boolean
}

export const BusinessActiveSubscriptionView = ({ subscription, plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionSection subscription={subscription} />
    <SubscriptionPricing plans={plans} />
  </div>
)
