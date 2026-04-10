export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface AccountTypeOption {
  value: AccountTypeValue
  label: string
}

export interface UISubscription {
  id: string
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
  autoRenewal?: boolean
}

export interface UISubscriptionPlan {
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

export interface SubscriptionPlan {
  id: string
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

export interface SubscriptionSectionProps {
  subscription?: UISubscription
  onAutoRenewalChange?: (checked: boolean) => void
}

export interface SubscriptionPricingProps {
  plans: SubscriptionPlan[]
  selectedPlan?: SubscriptionPlanValue
  onPlanChange?: (plan: SubscriptionPlanValue) => void
  onPayPalClick?: () => void
  onStripeClick?: () => void
  isPaymentLocked?: boolean
}

export const mapSubscriptionToUI = (sub: Subscription): UISubscription => ({
  id: sub.id,
  expireDate: sub.expireDate,
  nextPaymentDate: sub.nextPaymentDate,
  isActive: sub.isActive,
  autoRenewal: sub.autoRenewal,
})

export const mapPlanToUI = (plan: SubscriptionPlan): UISubscriptionPlan => ({
  id: plan.id,
  value: plan.value,
  label: plan.label,
  price: plan.price,
  period: plan.period,
})
