// @vitest-environment jsdom
import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountManagement } from './AccountManagement'

const mocks = vi.hoisted(() => {
  return {
    showToastAlert: vi.fn(),
    refetch: vi.fn().mockResolvedValue({ data: { data: [] } }),
    createSubscription: vi.fn(),
  }
})

vi.mock('@/shared/lib', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()

  return {
    ...actual,
    formatDate: (value: string) => value,
    showToastAlert: mocks.showToastAlert,
  }
})

vi.mock('@/features/subscriptions/api', () => ({
  useGetPricingQuery: () => ({
    data: {
      data: [{ amount: 10, typeDescription: 'DAY' }],
    },
  }),
  useGetCurrentSubscriptionQuery: () => ({
    data: { data: [], hasAutoRenewal: false },
    refetch: mocks.refetch,
  }),
  useCreateSubscriptionMutation: () => [mocks.createSubscription, { isLoading: false }],
  useCancelAutoRenewalMutation: () => [vi.fn(), { isLoading: false }],
  useRenewAutoRenewalMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock('@/features/subscriptions/hooks', () => ({
  usePaymentReturnFlow: () => ({
    isPolling: false,
    flowStatus: 'idle',
    flowErrorCode: null,
    resetFlow: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/1/settings/account-management',
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('AccountManagement payment errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        href: '',
      },
      writable: true,
      configurable: true,
    })
  })

  it.each([
    [400, 'Invalid payment request. Please try again.'],
    [401, 'Session expired. Please sign in again.'],
    [404, 'Selected subscription plan was not found.'],
    [409, 'This subscription is already active.'],
  ])('shows correct toast for %s error', async (status, message) => {
    mocks.createSubscription.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status }),
    })

    render(<AccountManagement />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mocks.showToastAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          type: 'error',
        })
      )
    })
  })
})
