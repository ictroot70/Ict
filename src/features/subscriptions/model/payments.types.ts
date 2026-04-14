import { PaymentsSortBy, PaymentsSortDirection, CreateSubscriptionInputDto } from '@/shared/types'

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
