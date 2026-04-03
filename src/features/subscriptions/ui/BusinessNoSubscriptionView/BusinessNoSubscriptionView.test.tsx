/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

import { BusinessNoSubscriptionView } from './BusinessNoSubscriptionView'
import { AccountTypeValue, SubscriptionPlanValue } from '@/features/profile/settings/model/types'

// ── Моки ────────────────────────────────────────────────────────────────────
vi.mock('@/shared/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}))

vi.mock('@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({
    accountTypes,
    selectedType,
    onTypeChange,
  }: any) => (
    <div data-testid="account-type-section">
      {accountTypes.map((type: any) => (
        <label key={type.value}>
          <input
            type="radio"
            name="accountType"
            value={type.value}
            checked={selectedType === type.value}
            onChange={() => onTypeChange(type.value)}
            aria-label={type.label}
            data-testid={`radio-${type.value}`}
          />
          {type.label}
        </label>
      ))}
    </div>
  ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({ plans, onPayPalClick, onStripeClick, isPaymentLocked }: any) => (
    <div data-testid="subscription-pricing">
      {plans.map((p: any) => (
        <label key={p.id}>
          <input
            type="radio"
            name="plan"
            value={p.value}
            aria-label={p.label}
            data-testid={`plan-radio-${p.value}`}
          />
          {p.label}
        </label>
      ))}
      <button onClick={onPayPalClick} disabled={isPaymentLocked} aria-label="Pay with PayPal">
        PayPal
      </button>
      <button onClick={onStripeClick} disabled={isPaymentLocked} aria-label="Pay with Stripe">
        Stripe
      </button>
    </div>
  ),
}))

// ─── Тесты ────────────────────────────────────────────────────────────────────
describe('BusinessNoSubscriptionView', () => {
  // ✅ Используем правильный тип для value
  const mockPlans = [
    {
      id: '1',
      value: 'month' as SubscriptionPlanValue,
      label: '$10 per month',
      price: '10',
      period: 'MONTHLY',
    },
    {
      id: '2',
      value: '7day' as SubscriptionPlanValue,
      label: '$50 per 7 days',
      price: '50',
      period: 'WEEKLY',
    },
    {
      id: '3',
      value: '1day' as SubscriptionPlanValue,
      label: '$10 per day',
      price: '10',
      period: 'DAY',
    },
  ]

  const defaultProps = {
    accountType: 'business' as AccountTypeValue,
    onAccountTypeChange: vi.fn(),
    plans: mockPlans,
    selectedPlan: 'month' as SubscriptionPlanValue,
    onPlanChange: vi.fn(),
    onPayPalClick: vi.fn(),
    onStripeClick: vi.fn(),
    isPaymentLocked: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders AccountTypeSection and SubscriptionPricing', () => {
    render(<BusinessNoSubscriptionView {...defaultProps} />)

    expect(screen.getByTestId('account-type-section')).toBeInTheDocument()
    expect(screen.getByTestId('subscription-pricing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /paypal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stripe/i })).toBeInTheDocument()
  })

  it('does NOT render SubscriptionSection (no active subscription)', () => {
    render(<BusinessNoSubscriptionView {...defaultProps} />)

    expect(screen.queryByTestId('subscription-section')).not.toBeInTheDocument()
  })

  it('forwards account type change callback', async () => {
    const user = userEvent.setup()
    render(<BusinessNoSubscriptionView {...defaultProps} />)

    await user.click(screen.getByLabelText('Personal'))
    expect(defaultProps.onAccountTypeChange).toHaveBeenCalledWith('personal')
  })

  it('disables payment buttons when isPaymentLocked', () => {
    render(<BusinessNoSubscriptionView {...defaultProps} isPaymentLocked />)

    const paypalBtn = screen.getByRole('button', { name: /paypal/i })
    const stripeBtn = screen.getByRole('button', { name: /stripe/i })

    expect(paypalBtn).toBeDisabled()
    expect(stripeBtn).toBeDisabled()
  })
})