import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { describe, expect, it } from 'vitest'

import { hasNewSubscription } from './subscriptionDiff'

const make = (id: string): ActiveSubscriptionViewModel => ({
  userId: 1,
  subscriptionId: id,
  dateOfPayment: '2024-01-01',
  endDateOfSubscription: '2024-02-01',
  autoRenewal: false,
})

describe('hasNewSubscription', () => {
  it('returns true when list grew', () => {
    expect(hasNewSubscription([make('a')], [make('a'), make('b')])).toBe(true)
  })

  it('returns true when new subscriptionId appeared', () => {
    expect(hasNewSubscription([make('a')], [make('b')])).toBe(true)
  })

  it('returns false when list is identical', () => {
    expect(hasNewSubscription([make('a')], [make('a')])).toBe(false)
  })

  it('returns false when list is empty on both sides', () => {
    expect(hasNewSubscription([], [])).toBe(false)
  })
})
