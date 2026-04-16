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
  Loading: () => <div data-testid={'loading'} />,
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
  }) => (
    <div role={'radiogroup'}>
      {options.map(option => (
        <label key={option.id}>
          <input
            type={'radio'}
            name={'plan'}
            aria-label={option.label}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onValueChange?.(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
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
  }) => (
    <button type={'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  }) => (
    <label>
      <input
        type={'checkbox'}
        aria-label={label}
        checked={!!checked}
        disabled={!!disabled}
        onChange={event => onCheckedChange?.(event.currentTarget.checked)}
      />
      {label}
    </label>
  ),
  ScrollAreaRadix: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

const createCurrentSubscriptionChainResult = (partial?: {
  hasAutoRenewal?: boolean
  isToggleLoading?: boolean
  isToggleDisabled?: boolean
  hasQueueInvariantViolation?: boolean
  subscriptions?: ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']
  toggleAutoRenewal?: ReturnType<typeof useCurrentSubscriptionChain>['toggleAutoRenewal']
}) =>
  ({
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
  }) as ReturnType<typeof useCurrentSubscriptionChain>

describe('SubscriptionPricing', () => {
  it('hides current subscription block for user without active subscriptions', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [],
        hasAutoRenewal: false,
        isToggleDisabled: true,
      })
    )

    render(<SubscriptionPricing plans={plans} />)

    expect(screen.queryByText('Current Subscription:')).toBeNull()
    expect(screen.queryByLabelText('Auto-Renewal')).toBeNull()
  })

  it('renders current and next subscriptions with normalized next payment dates', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(createCurrentSubscriptionChainResult())

    render(<SubscriptionPricing plans={plans} />)

    expect(screen.getByText('Expire at')).not.toBeNull()
    expect(screen.getByText('Next payment')).not.toBeNull()
    expect(screen.getAllByText('01.04.2026').length).toBe(2)
    expect(screen.getAllByText('01.05.2026').length).toBe(2)
    expect(screen.getAllByText('01.06.2026').length).toBe(2)
    expect(screen.queryByText('—')).toBeNull()
    expect(screen.queryByRole('button', { name: /Show more/i })).toBeNull()
  })

  it('keeps next payment at or after current expiration for prepaid queue item', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [
          {
            userId: 1,
            subscriptionId: 'sub-current',
            dateOfPayment: '2026-03-17T00:00:00.000Z',
            endDateOfSubscription: '2026-04-17T00:00:00.000Z',
            autoRenewal: false,
          },
          {
            userId: 1,
            subscriptionId: 'sub-next',
            dateOfPayment: '2026-03-17T00:00:00.000Z',
            endDateOfSubscription: '2026-05-17T00:00:00.000Z',
            autoRenewal: false,
          },
        ],
        hasAutoRenewal: false,
      })
    )

    render(<SubscriptionPricing plans={plans} />)

    expect(screen.getAllByText('17.04.2026').length).toBeGreaterThan(0)
    expect(screen.queryByText('17.03.2026')).toBeNull()
  })

  it('calls toggle action from Auto-Renewal checkbox', () => {
    const toggleAutoRenewal = vi.fn()

    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        hasAutoRenewal: true,
        toggleAutoRenewal,
      })
    )

    render(<SubscriptionPricing plans={plans} />)

    fireEvent.click(screen.getByLabelText('Auto-Renewal'))

    expect(toggleAutoRenewal).toHaveBeenCalledTimes(1)
  })

  it('shows spinner while auto-renewal toggle mutation is in progress', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        isToggleLoading: true,
        isToggleDisabled: true,
      })
    )

    render(<SubscriptionPricing plans={plans} />)

    expect(screen.getByLabelText('Updating auto-renewal')).not.toBeNull()
  })
})
