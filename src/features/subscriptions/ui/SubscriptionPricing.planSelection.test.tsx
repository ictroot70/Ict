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
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type={'button'}>{children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CheckboxRadix: ({ label }: { label?: string }) => <input type={'checkbox'} aria-label={label} />,
  ScrollAreaRadix: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const useCurrentSubscriptionChainMock = vi.mocked(useCurrentSubscriptionChain)

const plans = [
  { id: 'DAY', value: '1day' as const, label: '$10 per 1 Day', price: '10', period: 'day' },
  {
    id: 'MONTHLY',
    value: 'month' as const,
    label: '$100 per month',
    price: '100',
    period: 'month',
  },
]

const createCurrentSubscriptionChainResult = () =>
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
  }) as ReturnType<typeof useCurrentSubscriptionChain>

describe('SubscriptionPricing plan selection', () => {
  it('calls onPlanChange when user selects a plan', () => {
    const onPlanChange = vi.fn()

    useCurrentSubscriptionChainMock.mockReturnValue(createCurrentSubscriptionChainResult())

    render(<SubscriptionPricing plans={plans} onPlanChange={onPlanChange} selectedPlan={'1day'} />)

    fireEvent.click(screen.getByLabelText('$100 per month'))

    expect(onPlanChange).toHaveBeenCalledWith('month')
  })

  it('shows fallback block when plans are missing', () => {
    useCurrentSubscriptionChainMock.mockReturnValue(createCurrentSubscriptionChainResult())

    render(<SubscriptionPricing plans={[]} />)

    expect(screen.getByText('No plans available')).not.toBeNull()
  })
})
