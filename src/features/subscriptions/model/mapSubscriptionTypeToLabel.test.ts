import { SubscriptionType } from '@/shared/types'
import { describe, expect, it } from 'vitest'

import { mapSubscriptionTypeToLabel } from './mapSubscriptionTypeToLabel'

describe('mapSubscriptionTypeToLabel', () => {
  it('maps DAY to 1 day', () => {
    expect(mapSubscriptionTypeToLabel(SubscriptionType.DAY)).toBe('1 day')
  })

  it('maps WEEKLY to 7 days', () => {
    expect(mapSubscriptionTypeToLabel(SubscriptionType.WEEKLY)).toBe('7 days')
  })

  it('maps MONTHLY to 1 month', () => {
    expect(mapSubscriptionTypeToLabel(SubscriptionType.MONTHLY)).toBe('1 month')
  })

  it('throws for unsupported value', () => {
    expect(() => mapSubscriptionTypeToLabel('YEARLY' as SubscriptionType)).toThrow(
      'Unsupported subscription type'
    )
  })
})
