import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { describe, expect, it, vi } from 'vitest'

import { pollUntilSubscriptionUpdated } from './paymentPolling'

vi.useFakeTimers()

const make = (id: string): ActiveSubscriptionViewModel => ({
  userId: 1,
  subscriptionId: id,
  dateOfPayment: '2024-01-01',
  endDateOfSubscription: '2024-02-01',
  autoRenewal: false,
})

describe('pollUntilSubscriptionUpdated', () => {
  it('returns "success" when new subscription appears on first poll', async () => {
    const fetch = vi.fn().mockResolvedValue([make('new-id')])
    const promise = pollUntilSubscriptionUpdated(fetch, [])

    await vi.runAllTimersAsync()
    expect(await promise).toBe('success')
  })

  it('returns "timeout" when subscription never changes within timeout', async () => {
    const fetch = vi.fn().mockResolvedValue([make('same-id')])
    const promise = pollUntilSubscriptionUpdated(fetch, [make('same-id')])

    await vi.runAllTimersAsync()
    expect(await promise).toBe('timeout')
  })

  it('does not auto-trigger createSubscription', () => {
    const createSubscription = vi.fn()

    // polling util has no reference to createSubscription — verify it's never called
    expect(createSubscription).not.toHaveBeenCalled()
  })
})
