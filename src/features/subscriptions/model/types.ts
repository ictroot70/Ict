import type { SubscriptionPlanValue } from '@/features/profile/settings/model/types'

export interface SubscriptionPlan {
  id: string
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}
export interface Subscription {
  id: string
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
  autoRenewal?: boolean
}

export interface SubscriptionSectionProps {
  subscription?: Subscription
  onAutoRenewalChange?: (checked: boolean) => void
}
export interface SubscriptionPricingProps {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  isPaymentLocked?: boolean
}
