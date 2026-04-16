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
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onCheckedChange?.(event.currentTarget.checked),
      }),
      label
    ),

  ScrollAreaRadix: ({
    children,
    viewportClassName,
  }: {
    children: React.ReactNode
    viewportClassName?: string
  }) => React.createElement('div', { className: viewportClassName }, children),

  Typography: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}))

const useCurrentSubscriptionChainMock = vi.mocked(useCurrentSubscriptionChain)

const plans = [
  { id: 'DAY', value: '1day' as const, label: '$10 per 1 Day', price: '10', period: 'day' },
]

const createSubscriptions = (tailHasAutoRenewal: boolean) =>
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
      autoRenewal: tailHasAutoRenewal,
    },
  ] as ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']

const createHookResult = (partial: {
  hasAutoRenewal: boolean
  subscriptions: ReturnType<typeof useCurrentSubscriptionChain>['subscriptions']
}) =>
  ({
    subscriptions: partial.subscriptions,
    hasAutoRenewal: partial.hasAutoRenewal,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetchCurrentSubscription: vi.fn(),
    toggleAutoRenewal: vi.fn(),
    isToggleLoading: false,
    isToggleDisabled: false,
    hasQueueInvariantViolation: false,
  }) as ReturnType<typeof useCurrentSubscriptionChain>

describe('SubscriptionPricing auto-renew scroll', () => {
  it('scrolls to tail subscription when auto-renew toggles OFF -> ON and row is outside viewport', () => {
    useCurrentSubscriptionChainMock
      .mockReturnValueOnce(
        createHookResult({
          hasAutoRenewal: false,
          subscriptions: createSubscriptions(false),
        })
      )
      .mockReturnValueOnce(
        createHookResult({
          hasAutoRenewal: true,
          subscriptions: createSubscriptions(true),
        })
      )

    const { rerender } = render(React.createElement(SubscriptionPricing, { plans }))

    const body = screen.getByTestId('current-subscription-body')
    const tailRow = body.querySelector('[data-subscription-id="sub-next-4"]')

    expect(tailRow).not.toBeNull()

    const scrollIntoView = vi.fn()

    Object.defineProperty(body, 'scrollTop', { configurable: true, value: 0 })
    Object.defineProperty(body, 'clientHeight', { configurable: true, value: 60 })
    Object.defineProperty(tailRow as HTMLElement, 'offsetTop', { configurable: true, value: 140 })
    Object.defineProperty(tailRow as HTMLElement, 'offsetHeight', { configurable: true, value: 24 })
    ;(tailRow as HTMLElement).scrollIntoView = scrollIntoView

    rerender(React.createElement(SubscriptionPricing, { plans }))

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('does not scroll when auto-renew toggles ON -> OFF', () => {
    useCurrentSubscriptionChainMock
      .mockReturnValueOnce(
        createHookResult({
          hasAutoRenewal: true,
          subscriptions: createSubscriptions(true),
        })
      )
      .mockReturnValueOnce(
        createHookResult({
          hasAutoRenewal: false,
          subscriptions: createSubscriptions(false),
        })
      )

    const { rerender } = render(React.createElement(SubscriptionPricing, { plans }))

    const body = screen.getByTestId('current-subscription-body')
    const tailRow = body.querySelector('[data-subscription-id="sub-next-4"]')

    expect(tailRow).not.toBeNull()

    const scrollIntoView = vi.fn()
    ;(tailRow as HTMLElement).scrollIntoView = scrollIntoView

    rerender(React.createElement(SubscriptionPricing, { plans }))

    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
