/**
 * @vitest-environment jsdom
 */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@testing-library/jest-dom'

import { BusinessActiveSubscriptionView } from './BusinessActiveSubscriptionView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({ selectedType }: { selectedType: string }) => (
    <div data-testid={'account-type'} data-value={selectedType} />
  ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({ isPaymentLocked }: { isPaymentLocked: boolean }) => (
    <div data-testid={'pricing'} data-locked={String(isPaymentLocked)} />
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
  it('passes isPaymentLocked to SubscriptionPricing', () => {
    render(<BusinessActiveSubscriptionView {...mockProps} isPaymentLocked />)
    expect(screen.getByTestId('pricing')).toHaveAttribute('data-locked', 'true')
  })

  it('renders without crashing when subscription is provided', () => {
    const { container } = render(
      <BusinessActiveSubscriptionView {...mockProps} subscription={mockSubscription} />
    )

    expect(screen.getByTestId('account-type')).toBeInTheDocument()
    expect(screen.getByTestId('pricing')).toBeInTheDocument()

    expect(container).toBeInTheDocument()
  })
})
