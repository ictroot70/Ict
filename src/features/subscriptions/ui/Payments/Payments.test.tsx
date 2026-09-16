/* @vitest-environment jsdom */

import type { PaymentsWithPaginationViewModel } from '@/shared/types'

import React from 'react'

import { usePaymentsTable } from '@/features/subscriptions/hooks'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Payments } from './Payments'

vi.mock('@/features/subscriptions/hooks', () => ({
  usePaymentsTable: vi.fn(),
}))

vi.mock('@/shared/ui', () => ({
  Typography: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),

  Pagination: () => React.createElement('div', { 'data-testid': 'pagination' }),
}))

vi.mock('./PaymentsTable', () => ({
  PaymentsTable: () => React.createElement('div', { 'data-testid': 'payments-table' }),
}))

type UsePaymentsTableResult = ReturnType<typeof usePaymentsTable>
const usePaymentsTableMock = vi.mocked(usePaymentsTable)

const asQueryResult = (partial: {
  isLoading: boolean
  isError: boolean
  data?: PaymentsWithPaginationViewModel
}) => partial as unknown as UsePaymentsTableResult['payments']

const createHookResult = (
  payments: UsePaymentsTableResult['payments']
): UsePaymentsTableResult => ({
  payments,
  sort: { key: null, direction: null },
  handleSort: vi.fn(),
  handlePageChange: vi.fn(),
  handleItemsPerPageChange: vi.fn(),
})

const createData = (itemsCount: number): PaymentsWithPaginationViewModel => ({
  totalCount: itemsCount,
  pagesCount: 1,
  page: 1,
  pageSize: 12,
  items: Array.from({ length: itemsCount }, (_, i) => ({
    userId: 1,
    subscriptionId: `sub-${i}`,
    dateOfPayment: '2024-01-02T12:00:00.000Z',
    endDateOfSubscription: '2024-02-03T12:00:00.000Z',
    price: 10,
    subscriptionType: 'MONTHLY',
    paymentType: 'STRIPE',
  })) as PaymentsWithPaginationViewModel['items'],
})

describe('Payments', () => {
  it('renders loading state', () => {
    usePaymentsTableMock.mockReturnValue(
      createHookResult(asQueryResult({ isLoading: true, isError: false }))
    )

    const { container } = render(React.createElement(Payments))

    expect(container.querySelector('span')).not.toBeNull()
  })

  it('renders error state', () => {
    usePaymentsTableMock.mockReturnValue(
      createHookResult(asQueryResult({ isLoading: false, isError: true }))
    )

    render(React.createElement(Payments))
    expect(screen.getByText('Failed to load payments')).not.toBeNull()
  })

  it('renders empty state', () => {
    usePaymentsTableMock.mockReturnValue(
      createHookResult(asQueryResult({ isLoading: false, isError: false, data: createData(0) }))
    )

    render(React.createElement(Payments))
    expect(screen.getByText('No payments yet')).not.toBeNull()
  })

  it('renders table and pagination on success', () => {
    usePaymentsTableMock.mockReturnValue(
      createHookResult(asQueryResult({ isLoading: false, isError: false, data: createData(1) }))
    )

    render(React.createElement(Payments))
    expect(screen.getByTestId('payments-table')).not.toBeNull()
    expect(screen.getByTestId('pagination')).not.toBeNull()
  })
})
