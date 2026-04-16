/* @vitest-environment jsdom */

import React from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SubscriptionPricing } from './SubscriptionPricing'

vi.mock('@/features/subscriptions/hooks', () => ({
  useCurrentSubscriptionChain: vi.fn(),
}))

vi.mock('@/shared/composites', () => ({
  Loading: () => React.createElement('div', { 'data-testid': 'loading' }),
}))

vi.mock('@ictroot/ui-kit', () => ({
  RadioGroupRadix: ({
    options,
    value,
    onValueChange,
    disabled,
  }: {
    options: Array<{ value: string; label: string; id: string }>
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
  }) =>
    React.createElement(
      'div',
      { role: 'radiogroup' },
      options.map(option =>
        React.createElement(
          'label',
          { key: option.id },
          React.createElement('input', {
            type: 'radio',
            name: 'plan',
            'aria-label': option.label,
            checked: value === option.value,
            disabled,
            onChange: () => onValueChange?.(option.value),
          }),
          option.label
        )
      )
    ),
}))

vi.mock('@/shared/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => React.createElement('button', { type: 'button', onClick, disabled }, children),

  Card: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),

  CheckboxRadix: ({
    label,
    checked,
    disabled,
    onCheckedChange,
  }: {
    label?: string
    checked?: boolean
    disabled?: boolean
    onCheckedChange?: (checked: boolean) => void
  }) =>
    React.createElement(
      'label',
      null,
      React.createElement('input', {
        type: 'checkbox',
        'aria-label': label,
        checked: !!checked,
        disabled: !!disabled,
        onChange: event => onCheckedChange?.(event.currentTarget.checked),
      }),
      label
    ),

  ScrollAreaRadix: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),

  Typography: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}))

const useCurrentSubscriptionChainMock = vi.mocked(useCurrentSubscriptionChain)

const plans = [
  { id: 'DAY', value: '1day' as const, label: '$10 per 1 Day', price: '10', period: 'day' },
  {
    id: 'WEEKLY',
    value: '7day' as const,
    label: '$50 per 7 Day',
    price: '50',
    period: 'week',
  },
  {
    id: 'MONTHLY',
    value: 'month' as const,
    label: '$100 per month',
    price: '100',
    period: 'month',
  },
]

const createCurrentSubscriptionChainResult = (partial?: any) => ({
  subscriptions: [
    {
      userId: 1,
      subscriptionId: 'sub-current',
      dateOfPayment: '2026-03-01T00:00:00.000Z',
      endDateOfSubscription: '2026-04-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next',
      dateOfPayment: '2026-04-01T00:00:00.000Z',
      endDateOfSubscription: '2026-05-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-2',
      dateOfPayment: '2026-05-01T00:00:00.000Z',
      endDateOfSubscription: '2026-06-01T00:00:00.000Z',
      autoRenewal: true,
    },
  ],
  hasAutoRenewal: true,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetchCurrentSubscription: vi.fn(),
  toggleAutoRenewal: vi.fn(),
  isToggleLoading: false,
  isToggleDisabled: false,
  hasQueueInvariantViolation: false,
  ...partial,
})

describe('SubscriptionPricing', () => {
  it('hides current subscription block for user without active subscriptions', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [],
        hasAutoRenewal: false,
        isToggleDisabled: true,
      })
    )

    render(React.createElement(SubscriptionPricing, { plans }))

    expect(screen.queryByText('Current Subscription:')).toBeNull()
    expect(screen.queryByLabelText('Auto-Renewal')).toBeNull()
  })

  it('renders current and next subscriptions', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(createCurrentSubscriptionChainResult())

    render(React.createElement(SubscriptionPricing, { plans }))

    expect(screen.getByText('Expire at')).not.toBeNull()
    expect(screen.getByText('Next payment')).not.toBeNull()
  })

  it('calls toggle action', () => {
    const toggleAutoRenewal = vi.fn()

    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        toggleAutoRenewal,
      })
    )

    render(React.createElement(SubscriptionPricing, { plans }))

    fireEvent.click(screen.getByLabelText('Auto-Renewal'))

    expect(toggleAutoRenewal).toHaveBeenCalledTimes(1)
  })
})
