import { SubscriptionType } from '@/shared/types'

import styles from './BusinessNoSubscriptionView.module.scss'

import { SubscriptionPlan } from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'

interface Props {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionType
  onPlanChange?: (plan: SubscriptionType) => void
}

export const BusinessNoSubscriptionView = ({ plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionPricing plans={plans} />
  </div>
)
