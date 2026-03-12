export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface Subscription {
  id: string
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

export interface AccountTypeOption {
  value: AccountTypeValue
  label: string
}

export interface AccountTypeSectionProps {
  accountTypes: AccountTypeOption[]
  selectedType: AccountTypeValue
  onTypeChange: (type: AccountTypeValue) => void
}
