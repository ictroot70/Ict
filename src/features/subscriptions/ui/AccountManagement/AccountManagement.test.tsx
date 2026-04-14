// @vitest-environment jsdom
import React from 'react'

import { PaymentType } from '@/shared/types'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountManagement } from './AccountManagement'

type Plan = { amount: number; typeDescription: string }

type Subscription = {
  subscriptionId: string
  endDateOfSubscription: string
  autoRenewal?: boolean
}

type AccountState = {
  flowStatus: 'idle' | 'polling' | 'success' | 'failed' | 'timeout'
  paymentResultStatus: 'idle' | 'success' | 'failure'
  selectedPlan: Plan | null
  pricingPlans: { data: Plan[] }
  isPaymentLocked: boolean
  isAutoRenewEnabled: boolean
  subscriptionQueue: Subscription[]
  handlePay: ReturnType<typeof vi.fn>
  handlePlanChange: ReturnType<typeof vi.fn>
  resetPaymentResult: ReturnType<typeof vi.fn>
}

const mocks = vi.hoisted(() => ({
  handlePay: vi.fn(),
  handlePlanChange: vi.fn(),
  handleSwitchAutoRenewal: vi.fn(),
  resetPaymentResult: vi.fn(),
  accountState: {} as AccountState,
  autoRenewState: {
    handleSwitchAutoRenewal: vi.fn(),
    isAutoRenewalChanging: false,
  },
}))

vi.mock('@/shared/lib', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()

  return { ...actual, formatDate: (v: string) => v }
})

vi.mock('@/features/subscriptions/hooks', () => ({
  useAccountManagement: () => mocks.accountState,
  useAutoRenewalActions: () => mocks.autoRenewState,
}))

vi.mock('@/features/subscriptions', () => ({
  PaymentConfirmationModal: ({ open, onConfirm }: any) =>
    open ? (
      <button type={'button'} onClick={onConfirm}>
        confirm payment
      </button>
    ) : null,
  PaymentFailureModal: () => null,
  PaymentSuccessModal: () => null,
}))

const messages = {
  subscriptions: {
    account: {
      stripe: 'STRIPE',
    },
  },
}

const renderAccountManagement = () =>
  render(
    <NextIntlClientProvider locale={'en'} messages={messages}>
      <AccountManagement />
    </NextIntlClientProvider>
  )

describe('AccountManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.accountState = {
      flowStatus: 'idle',
      paymentResultStatus: 'idle',
      selectedPlan: { amount: 10, typeDescription: 'DAY' },
      pricingPlans: { data: [{ amount: 10, typeDescription: 'DAY' }] },
      isPaymentLocked: false,
      isAutoRenewEnabled: false,
      subscriptionQueue: [],
      handlePay: mocks.handlePay,
      handlePlanChange: mocks.handlePlanChange,
      resetPaymentResult: mocks.resetPaymentResult,
    }

    mocks.autoRenewState = {
      handleSwitchAutoRenewal: mocks.handleSwitchAutoRenewal,
      isAutoRenewalChanging: false,
    }
  })

  it('shows polling state', () => {
    mocks.accountState.flowStatus = 'polling'

    renderAccountManagement()

    expect(screen.queryByText('Processing payment...')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'STRIPE' })).not.toBeNull()
  })

  it('renders plans and STRIPE button', () => {
    renderAccountManagement()

    expect(screen.queryByText('Change your subscription:')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'STRIPE' })).not.toBeNull()
  })

  it('calls handlePlanChange on radio select', () => {
    mocks.accountState.selectedPlan = null

    renderAccountManagement()

    const radio = screen.getByRole('radio')

    fireEvent.click(radio)

    expect(mocks.handlePlanChange).toHaveBeenCalled()
  })

  it('calls handlePay with STRIPE after confirmation', async () => {
    renderAccountManagement()

    fireEvent.click(screen.getByRole('button', { name: 'STRIPE' }))
    fireEvent.click(screen.getByText('confirm payment'))

    await waitFor(() => {
      expect(mocks.resetPaymentResult).toHaveBeenCalled()
      expect(mocks.handlePay).toHaveBeenCalledWith(PaymentType.STRIPE)
    })
  })

  it('disables pay button when payment is locked', () => {
    mocks.accountState.isPaymentLocked = true

    renderAccountManagement()

    const btn = screen.getByRole('button', { name: 'STRIPE' }) as HTMLButtonElement

    expect(btn.disabled).toBe(true)
  })

  it('renders current subscription block when subscription exists', () => {
    mocks.accountState.subscriptionQueue = [
      {
        subscriptionId: '1',
        endDateOfSubscription: '2026-05-01',
        autoRenewal: false,
      },
    ]

    renderAccountManagement()

    expect(screen.queryByText('Current Subscription:')).not.toBeNull()
    expect(screen.queryByText('Expire at')).not.toBeNull()
    expect(screen.getAllByText('2026-05-01').length).toBe(2)
  })
})
