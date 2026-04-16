import { PaymentsSortBy, PaymentsSortDirection, CreateSubscriptionInputDto } from '@/shared/types'

export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface UISubscriptionPlan {
  id: string
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

export interface SubscriptionPlan {
  id: string
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
}

export type PaymentsSortState = {
  key: PaymentsSortBy | null
  direction: PaymentsSortDirection | null
}

export type PaymentFlowState = {
  flowStatus: PaymentFlowStatus
  flowErrorCode: null | string
  isStarting: boolean
  startPayment: (input: CreateSubscriptionInputDto) => Promise<void>
  resetFlow: () => void
}

export type PollStatus = 'success' | 'timeout'

export type PaymentFlowStatus = 'idle' | 'success' | 'failure'

export type AccountModal = null | 'confirm' | 'success' | 'failure'
