/* @vitest-environment jsdom */
/* eslint-disable max-lines */

import React from 'react'

import { PaymentType } from '@/shared/types'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountManagement } from './AccountManagement'

type Plan = { amount: number; typeDescription: 'DAY' | 'WEEKLY' | 'MONTHLY' }

type Subscription = {
  subscriptionId: string
  endDateOfSubscription: string
  autoRenewal?: boolean
}

type AccountState = {
  flowStatus: 'idle' | 'polling' | 'success' | 'failed' | 'timeout'
  paymentResultStatus: 'idle' | 'success' | 'failure'
  selectedPlan: Plan | null
  pricingPlans?: { data: Plan[] }
  isLoading: boolean
  isPaymentLocked: boolean
  subscriptionQueue: Subscription[]
  handlePay: ReturnType<typeof vi.fn>
  handlePlanChange: ReturnType<typeof vi.fn>
  resetPaymentResult: ReturnType<typeof vi.fn>
}

const mocks = vi.hoisted(() => ({
  handlePay: vi.fn(),
  handlePlanChange: vi.fn(),
  resetPaymentResult: vi.fn(),
  accountState: {} as AccountState,
}))

vi.mock('@/features/subscriptions/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/features/subscriptions/hooks')>()

  return {
    ...actual,
    useAccountManagement: () => mocks.accountState,
  }
})

vi.mock('@/features/subscriptions/ui/PersonalView/PersonalView', () => ({
  PersonalView: ({ onAccountTypeChange }: { onAccountTypeChange: (type: 'business') => void }) =>
    React.createElement(
      'div',
      { 'data-testid': 'personal-view' },
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => onAccountTypeChange('business'),
        },
        'to business'
      )
    ),
}))

vi.mock('@/features/subscriptions/ui/BusinessSubscriptionView/BusinessSubscriptionView', () => ({
  BusinessSubscriptionView: ({
    onStripeClick,
    isPaymentLocked,
    onPlanChange,
    hasActiveSubscription,
  }: {
    onStripeClick?: () => void
    isPaymentLocked?: boolean
    onPlanChange?: (plan: 'month') => void
    hasActiveSubscription?: boolean
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'business-subscription-view',
        'data-active': String(Boolean(hasActiveSubscription)),
      },
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => onPlanChange?.('month'),
        },
        'select month'
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: onStripeClick,
          disabled: isPaymentLocked,
        },
        'STRIPE'
      )
    ),
}))

vi.mock('@/shared/composites', () => ({
  Loading: () => React.createElement('div', { 'data-testid': 'loading' }),
}))

vi.mock('../PaymentModals', () => ({
  PaymentConfirmationModal: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open
      ? React.createElement(
          'button',
          {
            type: 'button',
            onClick: onConfirm,
          },
          'confirm payment'
        )
      : null,

  PaymentProcessingModal: ({ open }: { open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'payment-processing-modal' }) : null,

  PaymentFailureModal: ({ open }: { open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'payment-failure-modal' }) : null,

  PaymentSuccessModal: ({ open }: { open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'payment-success-modal' }) : null,
}))

describe('AccountManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.accountState = {
      flowStatus: 'idle',
      paymentResultStatus: 'idle',
      selectedPlan: { amount: 10, typeDescription: 'DAY' },
      pricingPlans: { data: [{ amount: 10, typeDescription: 'DAY' }] },
      isLoading: false,
      isPaymentLocked: false,
      subscriptionQueue: [],
      handlePay: mocks.handlePay,
      handlePlanChange: mocks.handlePlanChange,
      resetPaymentResult: mocks.resetPaymentResult,
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders loading state', () => {
    mocks.accountState.isLoading = true

    render(React.createElement(AccountManagement))

    expect(screen.getByTestId('loading')).not.toBeNull()
  })

  it('renders personal view by default and switches to business without subscription', () => {
    render(React.createElement(AccountManagement))

    expect(screen.getByTestId('personal-view')).not.toBeNull()

    fireEvent.click(screen.getByText('to business'))

    expect(screen.getByTestId('business-subscription-view')).not.toBeNull()
    expect(screen.getByTestId('business-subscription-view').getAttribute('data-active')).toBe(
      'false'
    )
  })

  it('passes active-subscription flag to business subscription view when queue exists', () => {
    mocks.accountState.subscriptionQueue = [
      {
        subscriptionId: 'sub-1',
        endDateOfSubscription: '2026-05-01T00:00:00.000Z',
        autoRenewal: true,
      },
    ]

    render(React.createElement(AccountManagement))

    expect(screen.getByTestId('business-subscription-view').getAttribute('data-active')).toBe(
      'true'
    )
  })

  it('shows processing modal with anti-flicker delay when polling starts', async () => {
    vi.useFakeTimers()
    mocks.accountState.flowStatus = 'polling'

    render(React.createElement(AccountManagement))

    expect(screen.queryByTestId('payment-processing-modal')).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByTestId('payment-processing-modal')).not.toBeNull()
  })

  it('does not show processing modal when polling ends before anti-flicker delay', async () => {
    vi.useFakeTimers()
    mocks.accountState.flowStatus = 'polling'

    const { rerender } = render(React.createElement(AccountManagement))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })

    mocks.accountState.flowStatus = 'success'
    rerender(React.createElement(AccountManagement))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.queryByTestId('payment-processing-modal')).toBeNull()
  })

  it('keeps processing modal visible for minimum time after it has been shown', async () => {
    vi.useFakeTimers()
    mocks.accountState.flowStatus = 'polling'

    const { rerender } = render(React.createElement(AccountManagement))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByTestId('payment-processing-modal')).not.toBeNull()

    mocks.accountState.flowStatus = 'success'
    rerender(React.createElement(AccountManagement))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(screen.getByTestId('payment-processing-modal')).not.toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(screen.queryByTestId('payment-processing-modal')).toBeNull()
  })

  it('calls handlePay with STRIPE after payment confirmation', async () => {
    mocks.accountState.subscriptionQueue = [
      {
        subscriptionId: 'sub-1',
        endDateOfSubscription: '2026-05-01T00:00:00.000Z',
        autoRenewal: true,
      },
    ]

    render(React.createElement(AccountManagement))

    fireEvent.click(screen.getByRole('button', { name: 'STRIPE' }))
    fireEvent.click(screen.getByText('confirm payment'))

    await waitFor(() => {
      expect(mocks.resetPaymentResult).toHaveBeenCalledTimes(1)
      expect(mocks.handlePay).toHaveBeenCalledWith(PaymentType.STRIPE)
    })
  })

  it('disables stripe button when payment is locked', () => {
    mocks.accountState.subscriptionQueue = [
      {
        subscriptionId: 'sub-1',
        endDateOfSubscription: '2026-05-01T00:00:00.000Z',
        autoRenewal: true,
      },
    ]
    mocks.accountState.isPaymentLocked = true

    render(React.createElement(AccountManagement))

    const button = screen.getByRole('button', { name: 'STRIPE' }) as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })

  it('opens success modal when paymentResultStatus is success', async () => {
    mocks.accountState.paymentResultStatus = 'success'

    render(React.createElement(AccountManagement))

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-modal')).not.toBeNull()
    })
  })

  it('opens failure modal when paymentResultStatus is failure', async () => {
    mocks.accountState.paymentResultStatus = 'failure'

    render(React.createElement(AccountManagement))

    await waitFor(() => {
      expect(screen.getByTestId('payment-failure-modal')).not.toBeNull()
    })
  })
})
