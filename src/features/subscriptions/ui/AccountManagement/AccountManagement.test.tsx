// @vitest-environment jsdom
import React from 'react'

import { PaymentType } from '@/shared/types'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountManagement } from './AccountManagement'

type Plan = { amount: number; typeDescription: string }

type AccountState = {
  flowStatus: 'idle' | 'polling' | 'success' | 'failed' | 'timeout'
  paymentResultStatus: 'idle' | 'success' | 'failure'
  selectedPlan: Plan | null
  pricingPlans: { data: Plan[] }
  isPaymentLocked: boolean
  isAutoRenewEnabled: boolean
  currentSubscription: {
    endDateOfSubscription: string
    autoRenewal?: boolean
  } | null
  handlePay: ReturnType<typeof vi.fn>
  handlePlanChange: ReturnType<typeof vi.fn>
  resetPaymentResult: ReturnType<typeof vi.fn>
}

const mocks = vi.hoisted(() => ({
  handlePay: vi.fn(),
  handlePlanChange: vi.fn(),
  handleSwitchAutoRenewal: vi.fn(),
  resetPaymentResult: vi.fn(),
  accountState: {
    flowStatus: 'idle',
    paymentResultStatus: 'idle',
    selectedPlan: { amount: 10, typeDescription: 'DAY' },
    pricingPlans: { data: [{ amount: 10, typeDescription: 'DAY' }] },
    isPaymentLocked: false,
    isAutoRenewEnabled: false,
    currentSubscription: null,
    handlePay: vi.fn(),
    handlePlanChange: vi.fn(),
    resetPaymentResult: vi.fn(),
  } as AccountState,
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
        {'confirm payment'}
      </button>
    ) : null,
  PaymentFailureModal: () => null,
  PaymentSuccessModal: () => null,
}))

const messages = {
  subscriptions: {
    account: {
      stripe: 'STRIPE',
      autoRenewTitle: 'Auto-Renewal',
      autoRenewText: 'Auto renewal text',
      agree: 'I agree',
      sending: 'Sending...',
      ok: 'OK',
      errorTitle: 'Error',
      errorText: 'Payment failed',
      backToPayment: 'Back to payment',
      successTitle: 'Success',
      successText: 'Payment success',
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
      currentSubscription: null,
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

    expect(screen.getByText('Processing payment...')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'STRIPE' })).not.toBeNull()
  })

  it('renders plans and STRIPE button', () => {
    renderAccountManagement()

    expect(screen.getByText('Change your subscription:')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'STRIPE' })).not.toBeNull()
  })

  it('calls handlePlanChange on radio select', () => {
    mocks.accountState.selectedPlan = null
    renderAccountManagement()

    const radio = screen.getByRole('radio')

    fireEvent.click(radio)

    expect(mocks.handlePlanChange).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10, typeDescription: 'DAY' })
    )
  })

  it('calls handlePay with STRIPE after confirmation', async () => {
    renderAccountManagement()

    fireEvent.click(screen.getByRole('button', { name: 'STRIPE' }))
    fireEvent.click(screen.getByRole('button', { name: 'confirm payment' }))

    await waitFor(() => {
      expect(mocks.resetPaymentResult).toHaveBeenCalled()
      expect(mocks.handlePay).toHaveBeenCalledWith(PaymentType.STRIPE)
    })
  })

  it('disables pay button when payment is locked', () => {
    mocks.accountState.isPaymentLocked = true
    renderAccountManagement()

    const btn = screen.getByRole('button', { name: 'STRIPE' })

    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })
  it('renders current subscription block when subscription exists', () => {
    mocks.accountState.currentSubscription = {
      endDateOfSubscription: '2026-05-01',
    }

    renderAccountManagement()

    expect(screen.getByText('Current Subscription:')).not.toBeNull()
    expect(screen.getByText('Expire at')).not.toBeNull()
    expect(screen.getAllByText('2026-05-01')).toHaveLength(2)
    expect(screen.getByText('Auto-Renewal')).not.toBeNull()
  })
})
