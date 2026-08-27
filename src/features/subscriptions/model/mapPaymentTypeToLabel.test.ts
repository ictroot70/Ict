import { PaymentType } from '@/shared/types'
import { describe, expect, it } from 'vitest'

import { mapPaymentTypeToLabel } from './mapPaymentTypeToLabel'

describe('mapPaymentTypeToLabel', () => {
  it('returns Stripe for STRIPE', () => {
    expect(mapPaymentTypeToLabel(PaymentType.STRIPE)).toBe('Stripe')
  })

  it('returns PayPal for PAYPAL', () => {
    expect(mapPaymentTypeToLabel(PaymentType.PAYPAL)).toBe('PayPal')
  })

  it('returns Credit card for CREDIT_CARD', () => {
    expect(mapPaymentTypeToLabel(PaymentType.CREDIT_CARD)).toBe('Credit card')
  })

  it('throws for unsupported payment type', () => {
    expect(() => mapPaymentTypeToLabel('UNKNOWN' as PaymentType)).toThrow(
      'Unsupported payment type: UNKNOWN'
    )
  })
})
