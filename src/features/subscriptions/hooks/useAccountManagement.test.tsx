// @vitest-environment jsdom
import { PaymentType } from '@/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAccountManagement } from './useAccountManagement'

const mocks = vi.hoisted(() => ({
  showToastAlert: vi.fn(),
  refetch: vi.fn().mockResolvedValue({ data: { data: [] } }),
  createSubscription: vi.fn(),
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
})
