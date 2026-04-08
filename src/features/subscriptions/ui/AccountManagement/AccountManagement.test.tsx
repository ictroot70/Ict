// @vitest-environment jsdom
import React from 'react'

import { PaymentType } from '@/shared/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountManagement } from './AccountManagement'

type Plan = { amount: number; typeDescription: string }

type AccountState = {
  flowStatus: 'idle' | 'polling' | 'success' | 'failed' | 'timeout'
  selectedPlan: Plan | null
  pricingPlans: { data: Plan[] }
  isPaymentLocked: boolean
  isAutoRenewEnabled: boolean
  currentSubscriptions: null
  handlePay: ReturnType<typeof vi.fn>
  handlePlanChange: ReturnType<typeof vi.fn>
}

const mocks = vi.hoisted(() => ({
  handlePay: vi.fn(),
  handlePlanChange: vi.fn(),
  handleSwitchAutoRenewal: vi.fn(),
  accountState: {
    flowStatus: 'idle',
    selectedPlan: { amount: 10, typeDescription: 'DAY' },
    pricingPlans: { data: [{ amount: 10, typeDescription: 'DAY' }] },
    isPaymentLocked: false,
    isAutoRenewEnabled: false,
    currentSubscriptions: null,
    handlePay: vi.fn(),
    handlePlanChange: vi.fn(),
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

describe('AccountManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.accountState = {
      flowStatus: 'idle',
      selectedPlan: { amount: 10, typeDescription: 'DAY' },
      pricingPlans: { data: [{ amount: 10, typeDescription: 'DAY' }] },
      isPaymentLocked: false,
      isAutoRenewEnabled: false,
      currentSubscriptions: null,
      handlePay: mocks.handlePay,
      handlePlanChange: mocks.handlePlanChange,
    }

    mocks.autoRenewState = {
      handleSwitchAutoRenewal: mocks.handleSwitchAutoRenewal,
      isAutoRenewalChanging: false,
    }
  })
  it('shows polling state', () => {
    mocks.accountState.flowStatus = 'polling'
    render(<AccountManagement />)

    expect(screen.getByText('Processing payment...')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'STRIPE' })).toBeNull()
  })

  it('renders plans and STRIPE button', () => {
    render(<AccountManagement />)

    expect(screen.getByText('Change your subscription:')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'STRIPE' })).not.toBeNull()
  })

  it('calls handlePlanChange on radio select', () => {
    mocks.accountState.selectedPlan = null
    render(<AccountManagement />)

    const radio = screen.getByRole('radio')

    fireEvent.click(radio)

    expect(mocks.handlePlanChange).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10, typeDescription: 'DAY' })
    )
  })

  it('calls handlePay with STRIPE on click', () => {
    render(<AccountManagement />)

    fireEvent.click(screen.getByRole('button', { name: 'STRIPE' }))
    expect(mocks.handlePay).toHaveBeenCalledWith(PaymentType.STRIPE)
  })
  it('disables pay button when payment is locked', () => {
    mocks.accountState.isPaymentLocked = true
    render(<AccountManagement />)

    const btn = screen.getByRole('button', { name: 'STRIPE' })

    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })
})
