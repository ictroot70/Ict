/**
 * @vitest-environment jsdom
 */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BusinessNoSubscriptionView } from './BusinessNoSubscriptionView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({ selectedType, onTypeChange }: any) => (
    <div data-testid={'account-type-section'} data-selected={selectedType}>
      <button type={'button'} onClick={() => onTypeChange?.('business')}>
        Switch
      </button>
    </div>
  ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({ plans, isPaymentLocked, onPayPalClick }: any) => (
    <div data-testid={'subscription-pricing'} data-locked={isPaymentLocked}>
      <button type={'button'} onClick={onPayPalClick} disabled={isPaymentLocked}>
        PayPal
      </button>
      {plans?.map((p: any) => <span key={p.id}>{p.label}</span>)}
    </div>
  ),
}))

const mockProps = {
  accountType: 'personal' as const,
  onAccountTypeChange: vi.fn(),
  plans: [{ id: '1', value: 'month' as const, label: '$10/mo', price: '10', period: 'month' }],
  selectedPlan: 'month' as const,
  onPlanChange: vi.fn(),
  onPayPalClick: vi.fn(),
  onStripeClick: vi.fn(),
  isPaymentLocked: false,
}

describe('BusinessNoSubscriptionView', () => {
  it('renders AccountTypeSection and SubscriptionPricing', () => {
    render(<BusinessNoSubscriptionView {...mockProps} />)
    expect(screen.getByTestId('account-type-section')).not.toBeNull()
    expect(screen.getByTestId('subscription-pricing')).not.toBeNull()
  })

  it('calls onAccountTypeChange when type is changed', () => {
    render(<BusinessNoSubscriptionView {...mockProps} />)
    screen.getByText('Switch').click()
    expect(mockProps.onAccountTypeChange).toHaveBeenCalledWith('business')
  })
})
