/* @vitest-environment jsdom */
import React from 'react'

import {
  type PaymentsViewModel,
  PaymentType,
  PaymentsSortBy,
  SubscriptionType,
} from '@/shared/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PaymentsTable } from './PaymentsTable'

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => <img {...props} />,
}))
const items: PaymentsViewModel[] = [
  {
    userId: 1,
    subscriptionId: 'sub-1',
    dateOfPayment: '2024-01-02T12:00:00.000Z',
    endDateOfSubscription: '2024-02-03T12:00:00.000Z',
    price: 10,
    subscriptionType: SubscriptionType.MONTHLY,
    paymentType: PaymentType.STRIPE,
  },
]

describe('PaymentsTable', () => {
  it('renders columns and rows', () => {
    render(<PaymentsTable items={items} sort={{ key: null, direction: null }} onSort={vi.fn()} />)

    expect(screen.getByText('Date of payment')).not.toBeNull()
    expect(screen.getByText('End date')).not.toBeNull()
    expect(screen.getByText('Price')).not.toBeNull()
    expect(screen.getByText('Subscription Type')).not.toBeNull()
    expect(screen.getByText('Payment Type')).not.toBeNull()

    expect(screen.getByText('02.01.2024')).not.toBeNull()
    expect(screen.getByText('03.02.2024')).not.toBeNull()
    expect(screen.getByText('$10')).not.toBeNull()
    expect(screen.getByText('1 month')).not.toBeNull()
    expect(screen.getByText('Stripe')).not.toBeNull()
  })
  it('calls onSort for sortable columns', () => {
    const onSort = vi.fn()

    render(<PaymentsTable items={items} sort={{ key: null, direction: null }} onSort={onSort} />)

    fireEvent.click(screen.getByRole('button', { name: 'Date of payment' }))
    expect(onSort).toHaveBeenCalledWith(PaymentsSortBy.DATE_OF_PAYMENT)
  })

  it('does not render sort control for Subscription Type', () => {
    render(<PaymentsTable items={items} sort={{ key: null, direction: null }} onSort={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Subscription Type' })).toBeNull()
  })
})
