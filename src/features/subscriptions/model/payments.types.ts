import { PaymentsSortBy, PaymentsSortDirection } from '@/shared/types'

export type PaymentsSortState = {
  key: PaymentsSortBy | null
  direction: PaymentsSortDirection | null
}
