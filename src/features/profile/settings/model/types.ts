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

import type {
  Subscription as SubSubscription,
  SubscriptionPlan as SubSubscriptionPlan,
} from '@/features/subscriptions/model/types'

export interface UISubscription {
  id: string
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
}

export interface UISubscriptionPlan {
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

export const mapSubscriptionToUI = (sub: SubSubscription): UISubscription => ({
  id: sub.id,
  expireDate: sub.expireDate,
  nextPaymentDate: sub.nextPaymentDate,
  isActive: sub.isActive,
})

export const mapPlanToUI = (plan: SubSubscriptionPlan): UISubscriptionPlan => ({
  value: plan.value,
  label: plan.label,
  price: plan.price,
  period: plan.period,
})
