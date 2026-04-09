import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { waitForSubscriptionUpdate } from './paymentPolling'

const make = (
  id: string,
  overrides: Partial<ActiveSubscriptionViewModel> = {}
): ActiveSubscriptionViewModel => ({
  userId: 1,
  subscriptionId: id,
  dateOfPayment: '2024-01-01',
  endDateOfSubscription: '2024-02-01',
  autoRenewal: false,
  ...overrides,
})

describe('waitForSubscriptionUpdate ', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns success when subscription list grows on next poll', async () => {
    const fetchFn = vi
      .fn<() => Promise<ActiveSubscriptionViewModel[]>>()
      .mockResolvedValueOnce([make('a'), make('b')])

    const promise = waitForSubscriptionUpdate(fetchFn, [make('a')])

    await vi.advanceTimersByTimeAsync(3000)

    await expect(promise).resolves.toBe('success')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('returns success when existing subscription is updated in place', async () => {
    const fetchFn = vi.fn<() => Promise<ActiveSubscriptionViewModel[]>>().mockResolvedValueOnce([
      make('a', {
        endDateOfSubscription: '2024-03-01',
      }),
    ])

    const promise = waitForSubscriptionUpdate(fetchFn, [make('a')])

    await vi.advanceTimersByTimeAsync(3000)

    await expect(promise).resolves.toBe('success')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
  it('keeps polling until timeout when subscription data does not change', async () => {
    const fetchFn = vi
      .fn<() => Promise<ActiveSubscriptionViewModel[]>>()
      .mockResolvedValue([make('a')])

    const promise = waitForSubscriptionUpdate(fetchFn, [make('a')])

    await vi.advanceTimersByTimeAsync(90000)

    await expect(promise).resolves.toBe('timeout')
    expect(fetchFn).toHaveBeenCalledTimes(30)
  })
  it('waits for a later poll before returning success', async () => {
    const fetchFn = vi
      .fn<() => Promise<ActiveSubscriptionViewModel[]>>()
      .mockResolvedValueOnce([make('a')])
      .mockResolvedValueOnce([make('a'), make('b')])

    const promise = waitForSubscriptionUpdate(fetchFn, [make('a')])

    await vi.advanceTimersByTimeAsync(3000)
    expect(fetchFn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(3000)

    await expect(promise).resolves.toBe('success')
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
