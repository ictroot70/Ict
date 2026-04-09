// @vitest-environment jsdom
import type { PollOutcome } from '../model/paymentPolling'
import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { usePaymentReturnFlow } from './usePaymentReturnFlow'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  pollMock:
    vi.fn<
      (
        fetchFn: () => Promise<ActiveSubscriptionViewModel[]>,
        baseline: ActiveSubscriptionViewModel[]
      ) => Promise<PollOutcome>
    >(),
  searchParamsMock: vi.fn<() => URLSearchParams>(() => new URLSearchParams('success=true')),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/1/settings/account-management',
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: mocks.searchParamsMock,
}))

vi.mock('../model/paymentPolling', () => ({
  waitForSubscriptionUpdate: mocks.pollMock,
}))

vi.mock('@/shared/lib', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()

  return { ...actual, showToastAlert: vi.fn() }
})

describe('usePaymentReturnFlow idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    mocks.searchParamsMock.mockReturnValue(new URLSearchParams('success=true'))
  })
  it('does not start polling twice on rerender', async () => {
    sessionStorage.setItem('payment_pending', '1')
    mocks.pollMock.mockResolvedValue('success')

    const fetchSubscriptions = vi.fn().mockResolvedValue([])
    const { rerender } = renderHook(() => usePaymentReturnFlow({ fetchSubscriptions }))

    await waitFor(() => expect(mocks.pollMock).toHaveBeenCalledTimes(1))
    rerender()
    expect(mocks.pollMock).toHaveBeenCalledTimes(1)
  })
  it('fails without polling when pending flag exists without query param', async () => {
    sessionStorage.setItem('payment_pending', '1')

    mocks.searchParamsMock.mockReturnValue(new URLSearchParams(''))

    const { result } = renderHook(() => usePaymentReturnFlow({ fetchSubscriptions: vi.fn() }))

    await waitFor(() => expect(result.current.flowStatus).toBe('failed'))
    expect(sessionStorage.getItem('payment_pending')).toBeNull()
    expect(sessionStorage.getItem('payment_baseline')).toBeNull()
    expect(mocks.pollMock).not.toHaveBeenCalled()
  })
  it('clears state and skips polling on success=false', async () => {
    sessionStorage.setItem('payment_pending', '1')
    sessionStorage.setItem('payment_baseline', '[{"subscriptionId":"x"}]')

    mocks.searchParamsMock.mockReturnValue(new URLSearchParams('success=false'))

    renderHook(() => usePaymentReturnFlow({ fetchSubscriptions: vi.fn() }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalled())
    expect(sessionStorage.getItem('payment_pending')).toBeNull()
    expect(sessionStorage.getItem('payment_baseline')).toBeNull()
    expect(mocks.pollMock).not.toHaveBeenCalled()
  })
  it('fails without polling on success=true without pending state', async () => {
    mocks.searchParamsMock.mockReturnValue(new URLSearchParams('success=true'))

    const { result } = renderHook(() => usePaymentReturnFlow({ fetchSubscriptions: vi.fn() }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalled())
    expect(result.current.flowStatus).toBe('failed')
    expect(mocks.pollMock).not.toHaveBeenCalled()
  })
})
