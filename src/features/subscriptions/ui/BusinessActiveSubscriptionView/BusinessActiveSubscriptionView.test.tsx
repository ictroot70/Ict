/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BusinessActiveSubscriptionView } from './BusinessActiveSubscriptionView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({ selectedType }: any) => (
    <div data-testid="account-type" data-value={selectedType} />
  ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({ isPaymentLocked }: any) => (
    <div data-testid="pricing" data-locked={isPaymentLocked} />
  ),
}))

vi.mock('../SubscriptionSection/SubscriptionSection', () => ({
  SubscriptionSection: ({ subscription }: any) => (
    <div data-testid="subscription-section" data-active={subscription?.isActive} />
  ),
}))

const mockProps = {
  accountType: 'business' as const,
  onAccountTypeChange: vi.fn(),
  plans: [],
  onPlanChange: vi.fn(),
  onPayPalClick: vi.fn(),
  onStripeClick: vi.fn(),
  isPaymentLocked: false,
}

const mockSubscription = {
  id: '1',
  expireDate: '2025-12-31',
  nextPaymentDate: '2025-06-01',
  isActive: true,
  autoRenewal: false,
}

describe('BusinessActiveSubscriptionView', () => {
  it('renders SubscriptionSection when subscription is provided', () => {
    render(<BusinessActiveSubscriptionView {...mockProps} subscription={mockSubscription} />)
    expect(screen.getByTestId('subscription-section')).not.toBeNull()
    expect(screen.getByTestId('subscription-section')).toHaveAttribute('data-active', 'true')
  })

  it('does not render SubscriptionSection when subscription is undefined', () => {
    render(<BusinessActiveSubscriptionView {...mockProps} subscription={undefined} />)
    expect(screen.queryByTestId('subscription-section')).toBeNull()
  })

  it('passes isPaymentLocked to SubscriptionPricing', () => {
    render(<BusinessActiveSubscriptionView {...mockProps} isPaymentLocked={true} />)
    expect(screen.getByTestId('pricing')).toHaveAttribute('data-locked', 'true')
  })
})