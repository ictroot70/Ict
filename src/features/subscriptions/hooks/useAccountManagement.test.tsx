// @vitest-environment jsdom
import { PaymentType } from '@/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAccountManagement } from './useAccountManagement'

function createDeferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>(res => {
    resolve = res
  })

  return { promise, resolve }
}

const mocks = vi.hoisted(() => ({
  showToastAlert: vi.fn(),
  refetch: vi.fn().mockResolvedValue({ data: { data: [] } }),
  createSubscription: vi.fn(),
  clearPaymentState: vi.fn(() => {
    sessionStorage.removeItem('payment_pending')
    sessionStorage.removeItem('payment_baseline')
  }),
}))

vi.mock('@/shared/lib', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()

  return { ...actual, showToastAlert: mocks.showToastAlert }
})

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/1/settings/account-management',
}))

vi.mock('./usePaymentReturnFlow', () => ({
  usePaymentReturnFlow: () => ({
    isPolling: false,
    flowStatus: 'idle',
    clearPaymentState: mocks.clearPaymentState,
  }),
}))

vi.mock('@/features/subscriptions/api', () => ({
  useGetPricingQuery: () => ({
    data: { data: [{ amount: 10, typeDescription: 'DAY' }] },
  }),
  useGetCurrentSubscriptionQuery: () => ({
    data: { data: [], hasAutoRenewal: false },
    refetch: mocks.refetch,
  }),
  useCreateSubscriptionMutation: () => [mocks.createSubscription, { isLoading: false }],
}))

describe('useAccountManagement payment errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000', href: '' },
      writable: true,
      configurable: true,
    })
    sessionStorage.clear()
  })

  it.each([
    [400, 'Invalid payment request. Please try again.'],
    [401, 'Session expired. Please sign in again.'],
    [404, 'Selected subscription plan was not found.'],
    [409, 'This subscription is already active.'],
  ])('shows correct toast for %s and clears state', async (status, message) => {
    sessionStorage.setItem('payment_pending', '1')
    sessionStorage.setItem('payment_baseline', '[{"subscriptionId":"x"}]')
    mocks.createSubscription.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status }),
    })

    const { result } = renderHook(() => useAccountManagement())

    await act(async () => {
      await result.current.handlePay(PaymentType.STRIPE)
    })

    await waitFor(() => {
      expect(mocks.showToastAlert).toHaveBeenCalledWith(
        expect.objectContaining({ message, type: 'error' })
      )
    })
    expect(sessionStorage.getItem('payment_pending')).toBeNull()
    expect(sessionStorage.getItem('payment_baseline')).toBeNull()
  })

  it('locks payment immediately while current subscription baseline is loading', async () => {
    const refetchDeferred = createDeferred<{ data: { data: [] } }>()

    mocks.refetch.mockReturnValueOnce(refetchDeferred.promise)
    mocks.createSubscription.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ url: 'https://payments.example/checkout' }),
    })

    const { result } = renderHook(() => useAccountManagement())

    await waitFor(() => expect(result.current.selectedPlan).not.toBeNull())

    await act(async () => {
      void result.current.handlePay(PaymentType.STRIPE)
    })

    expect(result.current.isPaymentLocked).toBe(true)
    expect(mocks.createSubscription).not.toHaveBeenCalled()

    await act(async () => {
      refetchDeferred.resolve({ data: { data: [] } })
      await refetchDeferred.promise
    })
  })

  it('does not start duplicate payment while preparing baseline', async () => {
    const refetchDeferred = createDeferred<{ data: { data: [] } }>()

    mocks.refetch.mockReturnValueOnce(refetchDeferred.promise)
    mocks.createSubscription.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ url: 'https://payments.example/checkout' }),
    })

    const { result } = renderHook(() => useAccountManagement())

    await waitFor(() => expect(result.current.selectedPlan).not.toBeNull())

    await act(async () => {
      void result.current.handlePay(PaymentType.STRIPE)
      void result.current.handlePay(PaymentType.STRIPE)
    })

    expect(mocks.refetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      refetchDeferred.resolve({ data: { data: [] } })
      await refetchDeferred.promise
    })
  })
})
