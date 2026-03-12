export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface Subscription {
  id: number
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
}

export interface SubscriptionPlan {
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

export interface AccountType {
  value: AccountTypeValue
  label: string
  description: string
}
