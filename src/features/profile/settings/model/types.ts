export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface AccountTypeOption {
  value: AccountTypeValue
  label: string
}

export interface AccountTypeSectionProps {
  accountTypes: AccountTypeOption[]
  selectedType: AccountTypeValue
  onTypeChange: (type: AccountTypeValue) => void
}

// Мапперы для преобразования между типами
export const mapSubscriptionToUI = (
  sub: import('@/features/subscriptions/model/types').Subscription
) => ({
  id: sub.id,
  expireDate: sub.expireDate,
  nextPaymentDate: sub.nextPaymentDate,
  isActive: sub.isActive,
  // autoRenewal не включаем, так как это не нужно в UI
})

export const mapPlanToUI = (
  plan: import('@/features/subscriptions/model/types').SubscriptionPlan
) => ({
  value: plan.value,
  label: plan.label,
  price: plan.price,
  period: plan.period,
  // id не включаем, так как это не нужно в UI
})
