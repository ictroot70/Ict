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
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const useCurrentSubscriptionChainMock = vi.mocked(useCurrentSubscriptionChain)

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

describe('SubscriptionPricing', () => {
  it('renders empty integration slots by default', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [],
        hasAutoRenewal: false,
        isToggleDisabled: true,
      })
    )

    const { container } = render(<SubscriptionPricing />)

    expect(screen.getByText('Account type:')).not.toBeNull()
    expect(screen.getByText('Change your subscription:')).not.toBeNull()
    expect(container.querySelector('[data-slot="account-type"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="change-subscription"]')).not.toBeNull()
  })

  it('renders custom integration slots from props', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [],
        hasAutoRenewal: false,
        isToggleDisabled: true,
      })
    )

    render(
      <SubscriptionPricing
        accountTypeSlot={<div data-testid={'custom-account-slot'} />}
        changeSubscriptionSlot={<div data-testid={'custom-change-slot'} />}
      />
    )

    expect(screen.getByTestId('custom-account-slot')).not.toBeNull()
    expect(screen.getByTestId('custom-change-slot')).not.toBeNull()
  })

  it('hides current subscription block for user without active subscriptions', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: [],
        hasAutoRenewal: false,
        isToggleDisabled: true,
      })
    )

    render(<SubscriptionPricing />)

    expect(screen.queryByText('Current Subscription:')).toBeNull()
    expect(screen.queryByLabelText('Auto-Renewal')).toBeNull()
  })

  it('renders current and next subscriptions with normalized next payment dates', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(createCurrentSubscriptionChainResult())

    render(<SubscriptionPricing />)

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

    render(<SubscriptionPricing />)

    expect(screen.getByText('17.04.2026')).not.toBeNull()
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
    render(<SubscriptionPricing />)
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
    render(<SubscriptionPricing />)
    expect(screen.getByLabelText('Updating auto-renewal')).not.toBeNull()
  })

  it('shows full queue in a single list without Show more toggle', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        subscriptions: createLongQueueSubscriptions(),
      })
    )

    render(<SubscriptionPricing />)

    expect(screen.getByText('01.08.2026')).not.toBeNull()
    expect(screen.queryByRole('button', { name: /Show more/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Show less/i })).toBeNull()
    expect(screen.queryByText('Next subscriptions')).toBeNull()
  })

  it('disables toggle and shows queue invariant warning for invalid chain', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(
      createCurrentSubscriptionChainResult({
        hasQueueInvariantViolation: true,
        isToggleDisabled: true,
      })
    )

    render(<SubscriptionPricing />)

    expect(
      screen.getByText(
        'Queue invariant violated: auto-renew must be enabled only on the last subscription.'
      )
    ).not.toBeNull()
    const autoRenewalCheckbox = screen.getByLabelText('Auto-Renewal')

    expect((autoRenewalCheckbox as HTMLInputElement).disabled).toBe(true)
  })
})
