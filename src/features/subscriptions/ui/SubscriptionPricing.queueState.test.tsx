/* @vitest-environment jsdom */

import React from 'react'

import { useCurrentSubscriptionChain } from '@/features/subscriptions/hooks'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SubscriptionPricing } from './SubscriptionPricing'

vi.mock('@/features/subscriptions/hooks', () => ({
  useCurrentSubscriptionChain: vi.fn(),
}))

vi.mock('@/shared/composites', () => ({
  Loading: () => React.createElement('div', { 'data-testid': 'loading' }),
}))

vi.mock('@ictroot/ui-kit', () => ({
  RadioGroupRadix: () => React.createElement('div', { role: 'radiogroup' }),
}))

vi.mock('@/shared/ui', () => ({
  Button: ({ children }: { children: React.ReactNode }) =>
    React.createElement('button', { type: 'button' }, children),

  Card: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),

  CheckboxRadix: ({
    label,
    checked,
    disabled,
  }: {
    label?: string
    checked?: boolean
    disabled?: boolean
  }) =>
    React.createElement('input', {
      type: 'checkbox',
      'aria-label': label,
      checked: !!checked,
      disabled: !!disabled,
      readOnly: true,
    }),

  ScrollAreaRadix: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),

  Typography: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}))

const useCurrentSubscriptionChainMock = vi.mocked(useCurrentSubscriptionChain)

const plans = [
  { id: 'DAY', value: '1day' as const, label: '$10 per 1 Day', price: '10', period: 'day' },
]

const createCurrentSubscriptionChainResult = (partial?: {
  hasQueueInvariantViolation?: boolean
  isToggleDisabled?: boolean
  subscriptions?: ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']
}) =>
  ({
    subscriptions: [],
    hasAutoRenewal: false,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetchCurrentSubscription: vi.fn(),
    toggleAutoRenewal: vi.fn(),
    isToggleLoading: false,
    isToggleDisabled: true,
    hasQueueInvariantViolation: false,
    ...partial,
  }) as ReturnType<typeof useCurrentSubscriptionChain>

const createLongQueueSubscriptions = () =>
  [
    {
      userId: 1,
      subscriptionId: 'sub-current',
      dateOfPayment: '2026-03-01T00:00:00.000Z',
      endDateOfSubscription: '2026-04-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-1',
      dateOfPayment: '2026-04-01T00:00:00.000Z',
      endDateOfSubscription: '2026-05-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-2',
      dateOfPayment: '2026-05-01T00:00:00.000Z',
      endDateOfSubscription: '2026-06-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-3',
      dateOfPayment: '2026-06-01T00:00:00.000Z',
      endDateOfSubscription: '2026-07-01T00:00:00.000Z',
      autoRenewal: false,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-4',
      dateOfPayment: '2026-07-01T00:00:00.000Z',
      endDateOfSubscription: '2026-08-01T00:00:00.000Z',
      autoRenewal: true,
    },
  ] as ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']

const createInvalidQueueSubscriptions = () =>
  [
    {
      userId: 1,
      subscriptionId: 'sub-current',
      dateOfPayment: '2026-03-01T00:00:00.000Z',
      endDateOfSubscription: '2026-04-01T00:00:00.000Z',
      autoRenewal: true,
    },
    {
      userId: 1,
      subscriptionId: 'sub-next-1',
      dateOfPayment: '2026-04-01T00:00:00.000Z',
      endDateOfSubscription: '2026-05-01T00:00:00.000Z',
      autoRenewal: false,
    },
  ] as ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']

describe('SubscriptionPricing queue states', () => {
  it('shows full queue in a single list without Show more toggle', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: createLongQueueSubscriptions(),
      })
    )

    render(React.createElement(SubscriptionPricing, { plans }))

    expect(screen.getAllByText(/01\.08\.2026/).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Show less' })).toBeNull()
    expect(screen.queryByText('Next subscriptions')).toBeNull()
  })

  it('disables toggle for invalid chain without exposing technical warning text', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: createInvalidQueueSubscriptions(),
        hasQueueInvariantViolation: true,
        isToggleDisabled: true,
      })
    )

    render(React.createElement(SubscriptionPricing, { plans }))

    expect(
      screen.queryByText(
        'Queue invariant violated: auto-renew must be enabled only on the last subscription.'
      )
    ).toBeNull()

    expect((screen.getByLabelText('Auto-Renewal') as HTMLInputElement).disabled).toBe(true)
  })
})
