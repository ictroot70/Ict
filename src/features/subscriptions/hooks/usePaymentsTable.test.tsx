/* @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePaymentsTable } from './usePaymentsTable'
import { useGetPaymentsQuery } from '@/features/subscriptions/api'
import {
  DEFAULT_PAYMENTS_PAGE_NUMBER,
  DEFAULT_PAYMENTS_PAGE_SIZE,
} from '@/features/subscriptions/model'
import { PaymentsSortBy, PaymentsSortDirection } from '@/shared/types'

vi.mock('@/features/subscriptions/api', () => ({
  useGetPaymentsQuery: vi.fn(),
}))

const useGetPaymentsQueryMock = vi.mocked(useGetPaymentsQuery)

const createPaymentsResult = () =>
  ({
    isLoading: false,
    isError: false,
    data: undefined,
  }) as unknown as ReturnType<typeof useGetPaymentsQuery>

beforeEach(() => {
  useGetPaymentsQueryMock.mockReturnValue(createPaymentsResult())
  useGetPaymentsQueryMock.mockClear()
})
describe('usePaymentsTable', () => {
  it('uses defaults and no sort', () => {
    const { result } = renderHook(() => usePaymentsTable())

    expect(result.current.sort).toEqual({ key: null, direction: null })
    expect(useGetPaymentsQueryMock).toHaveBeenLastCalledWith({
      pageNumber: DEFAULT_PAYMENTS_PAGE_NUMBER,
      pageSize: DEFAULT_PAYMENTS_PAGE_SIZE,
    })
  })

  it('toggles sort asc -> desc -> reset', () => {
    const { result } = renderHook(() => usePaymentsTable())

    act(() => result.current.handleSort(PaymentsSortBy.END_DATE))
    expect(result.current.sort).toEqual({
      key: PaymentsSortBy.END_DATE,
      direction: PaymentsSortDirection.ASC,
    })

    act(() => result.current.handleSort(PaymentsSortBy.END_DATE))
    expect(result.current.sort).toEqual({
      key: PaymentsSortBy.END_DATE,
      direction: PaymentsSortDirection.DESC,
    })

    act(() => result.current.handleSort(PaymentsSortBy.END_DATE))
    expect(result.current.sort).toEqual({ key: null, direction: null })
  })

  it('resets page to 1 on sort change', () => {
    const { result } = renderHook(() => usePaymentsTable())

    act(() => result.current.handlePageChange(3))
    expect(useGetPaymentsQueryMock).toHaveBeenLastCalledWith({
      pageNumber: 3,
      pageSize: DEFAULT_PAYMENTS_PAGE_SIZE,
    })

    act(() => result.current.handleSort(PaymentsSortBy.PRICE))
    expect(useGetPaymentsQueryMock).toHaveBeenLastCalledWith({
      pageNumber: DEFAULT_PAYMENTS_PAGE_NUMBER,
      pageSize: DEFAULT_PAYMENTS_PAGE_SIZE,
      sortBy: PaymentsSortBy.PRICE,
      sortDirection: PaymentsSortDirection.ASC,
    })
  })

  it('resets page to 1 on page size change', () => {
    const { result } = renderHook(() => usePaymentsTable())

    act(() => result.current.handlePageChange(4))
    act(() => result.current.handleItemsPerPageChange(16))

    expect(useGetPaymentsQueryMock).toHaveBeenLastCalledWith({
      pageNumber: DEFAULT_PAYMENTS_PAGE_NUMBER,
      pageSize: 16,
    })
  })
})
