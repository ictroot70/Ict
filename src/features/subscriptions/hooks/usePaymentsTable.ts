import { useMemo, useState } from 'react'

import { PaymentsSortBy, PaymentsSortDirection } from '@/shared/types'

import { useGetPaymentsQuery } from '@/features/subscriptions/api'

import {
  PaymentsSortState,
  DEFAULT_PAYMENTS_PAGE_SIZE,
  DEFAULT_PAYMENTS_PAGE_NUMBER,
} from '@/features/subscriptions/model'

export function usePaymentsTable() {
  const [pageSize, setPageSize] = useState(DEFAULT_PAYMENTS_PAGE_SIZE)
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAYMENTS_PAGE_NUMBER)

  const [sort, setSort] = useState<PaymentsSortState>({
    key: null,
    direction: null,
  })

  const handleSort = (key: PaymentsSortBy) => {
    if (sort.key !== key) {
      setSort({ key, direction: PaymentsSortDirection.ASC })
      return
    }

    if (sort.direction === PaymentsSortDirection.ASC) {
      setSort({ key, direction: PaymentsSortDirection.DESC })
      return
    }

    setSort({ key: null, direction: null })
  }

  const handlePageChange = (page: number) => setPageNumber(page)

  const handleItemsPerPageChange = (size: number) => {
    setPageSize(size)
    setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)
  }

  const query = useMemo(
    () => ({
      pageNumber,
      pageSize,
      ...(sort.key && sort.direction ? { sortBy: sort.key, sortDirection: sort.direction } : {}),
    }),
    [pageNumber, pageSize, sort]
  )

  const payments = useGetPaymentsQuery(query)

  return {
    payments,
    sort,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
  }
}
