import { PaymentType } from '@/shared/types'

const assertNever = (value: never): never => {
  throw new Error(`Unsupported payment type: ${String(value)}`)
}

export const mapPaymentTypeToLabel = (type: PaymentType) => {
  switch (type) {
    case PaymentType.STRIPE:
      return 'Stripe'
    case PaymentType.PAYPAL:
      return 'PayPal'
    case PaymentType.CREDIT_CARD:
      return 'Credit card'
    default:
      return assertNever(type)
  }
}
