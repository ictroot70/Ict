/**
 * @vitest-environment jsdom
 */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BusinessSubscriptionView } from './BusinessSubscriptionView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({ selectedType, accountTypes }: any) => (
    <div data-testid={'account-type-section'} data-selected={selectedType}>
      <span data-testid={'personal-disabled'}>
        {String(
          accountTypes.find(
            (item: { value: string; disabled?: boolean }) => item.value === 'personal'
          )?.disabled
        )}
      </span>
    </div>
  ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({ isPaymentLocked, accountTypeSlot }: any) => (
    <div data-testid={'subscription-pricing'} data-locked={String(isPaymentLocked)}>
      {accountTypeSlot}
    </div>
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

describe('BusinessSubscriptionView', () => {
  it('passes lock flag to SubscriptionPricing', () => {
    render(<BusinessSubscriptionView {...mockProps} isPaymentLocked hasActiveSubscription />)

    expect(screen.getByTestId('subscription-pricing').getAttribute('data-locked')).toBe('true')
  })

  it('disables personal account type when active subscription exists', () => {
    render(<BusinessSubscriptionView {...mockProps} hasActiveSubscription />)

    expect(screen.getByTestId('personal-disabled').textContent).toBe('true')
  })

  it('keeps personal account type enabled when no active subscription exists', () => {
    render(<BusinessSubscriptionView {...mockProps} hasActiveSubscription={false} />)

    expect(screen.getByTestId('personal-disabled').textContent).toBe('false')
  })
})
