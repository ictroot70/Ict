import { SubscriptionType } from '@/shared/types'

export interface SubscriptionPlan {
  id: string
  value: 'month' | '1day' | '7day'
  label: string
  price: string
  period: SubscriptionType
}

export interface Subscription {
  id: string
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
  autoRenewal: boolean
}

export interface SubscriptionSectionProps {
  subscription?: Subscription
  onAutoRenewalChange?: (checked: boolean) => void
}

export interface SubscriptionPricingProps {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionType
  onPlanSelect?: (plan: SubscriptionType) => void
  isSelectionLocked?: boolean
}
