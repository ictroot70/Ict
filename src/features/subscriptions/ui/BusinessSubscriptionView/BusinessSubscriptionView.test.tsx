/**
 * @vitest-environment jsdom
 */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BusinessSubscriptionView } from './BusinessSubscriptionView'

vi.mock('@/features/subscriptions/ui/AccountTypeSection/AccountTypeSection', () => ({
  AccountTypeSection: ({
    selectedType,
    accountTypes,
  }: {
    selectedType: string
    accountTypes: Array<{ value: string; disabled?: boolean }>
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'account-type-section',
        'data-selected': selectedType,
      },
      React.createElement(
        'span',
        { 'data-testid': 'personal-disabled' },
        String(accountTypes.find(item => item.value === 'personal')?.disabled)
      )
    ),
}))

vi.mock('../SubscriptionPricing', () => ({
  SubscriptionPricing: ({
    isPaymentLocked,
    accountTypeSlot,
  }: {
    isPaymentLocked?: boolean
    accountTypeSlot?: React.ReactNode
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'subscription-pricing',
        'data-locked': String(isPaymentLocked),
      },
      accountTypeSlot
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
    render(
      React.createElement(BusinessSubscriptionView, {
        ...mockProps,
        isPaymentLocked: true,
        hasActiveSubscription: true,
      })
    )

    expect(screen.getByTestId('subscription-pricing').getAttribute('data-locked')).toBe('true')
  })

  it('disables personal account type when active subscription exists', () => {
    render(
      React.createElement(BusinessSubscriptionView, {
        ...mockProps,
        hasActiveSubscription: true,
      })
    )

    expect(screen.getByTestId('personal-disabled').textContent).toBe('true')
  })

  it('keeps personal account type enabled when no active subscription exists', () => {
    render(
      React.createElement(BusinessSubscriptionView, {
        ...mockProps,
        hasActiveSubscription: false,
      })
    )

    expect(screen.getByTestId('personal-disabled').textContent).toBe('false')
  })
})
