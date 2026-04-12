/* @vitest-environment jsdom */
import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SubscriptionSection } from './SubscriptionSection'

vi.mock('@/shared/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid={'card'}>
      {children}
    </div>
  ),
  CheckboxRadix: ({ checked, onCheckedChange, label }: any) => (
    <label data-testid={'checkbox'}>
      <input
        type={'checkbox'}
        checked={checked}
        onChange={e => onCheckedChange?.(e.target.checked)}
      />
      {label}
    </label>
  ),
  Typography: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

const mockSubscription = {
  id: '1',
  expireDate: '2025-12-31',
  nextPaymentDate: '2025-06-01',
  isActive: true,
  autoRenewal: false,
}

describe('SubscriptionSection', () => {
  it('renders "No active subscription" when no subscription provided', () => {
    render(<SubscriptionSection />)
    expect(screen.getByText('No active subscription')).not.toBeNull()
  })

  it('renders subscription dates when subscription is provided', () => {
    render(<SubscriptionSection subscription={mockSubscription} />)
    expect(screen.getByText('Expire at:')).not.toBeNull()
    expect(screen.getByText('2025-12-31')).not.toBeNull()
    expect(screen.getByText('Next payment:')).not.toBeNull()
    expect(screen.getByText('2025-06-01')).not.toBeNull()
  })

  it('renders Auto-Renewal checkbox', () => {
    render(<SubscriptionSection subscription={mockSubscription} />)
    expect(screen.getByTestId('checkbox')).not.toBeNull()
    expect(screen.getByText('Auto-Renewal')).not.toBeNull()
  })
})
