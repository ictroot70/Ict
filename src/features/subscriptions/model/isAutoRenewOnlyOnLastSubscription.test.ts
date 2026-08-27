import { ActiveSubscriptionViewModel } from '@/shared/types'
import { describe, expect, it } from 'vitest'

import { isAutoRenewOnlyOnLastSubscription } from './isAutoRenewOnlyOnLastSubscription'

const createSubscription = (id: string, autoRenewal: boolean): ActiveSubscriptionViewModel => ({
  userId: 1,
  subscriptionId: id,
  dateOfPayment: '2026-03-01T00:00:00.000Z',
  endDateOfSubscription: '2026-04-01T00:00:00.000Z',
  autoRenewal,
})

describe('isAutoRenewOnlyOnLastSubscription', () => {
  it('returns true when auto-renew is enabled only for last subscription', () => {
    expect(
      isAutoRenewOnlyOnLastSubscription([
        createSubscription('sub-current', false),
        createSubscription('sub-next', true),
      ])
    ).toBe(true)
  })

  it('returns true when auto-renew is disabled for the whole queue', () => {
    expect(
      isAutoRenewOnlyOnLastSubscription([
        createSubscription('sub-current', false),
        createSubscription('sub-next', false),
      ])
    ).toBe(true)
  })

  it('returns false when non-tail subscription has auto-renew', () => {
    expect(
      isAutoRenewOnlyOnLastSubscription([
        createSubscription('sub-current', true),
        createSubscription('sub-next', false),
      ])
    ).toBe(false)
  })
})
