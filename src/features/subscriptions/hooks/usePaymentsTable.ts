import { useState } from 'react'

import { useGetPaymentsQuery } from '@/features/subscriptions/api'
import {
  DEFAULT_PAYMENTS_PAGE_NUMBER,
  DEFAULT_PAYMENTS_PAGE_SIZE,
  PaymentsSortState,
} from '@/features/subscriptions/model'
import { GetPaymentsRequestDto, PaymentsSortBy, PaymentsSortDirection } from '@/shared/types'

export function usePaymentsTable() {
  const [pageSize, setPageSize] = useState(DEFAULT_PAYMENTS_PAGE_SIZE)
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAYMENTS_PAGE_NUMBER)

  const [sort, setSort] = useState<PaymentsSortState>({
    key: null,
    direction: null,
  })

  const query: GetPaymentsRequestDto = {
    pageNumber,
    pageSize,
  }

  if (sort.key && sort.direction) {
    query.sortBy = sort.key
    query.sortDirection = sort.direction
  }

  const payments = useGetPaymentsQuery(query)

  const handleSort = (key: PaymentsSortBy) => {
    if (sort.key !== key) {
      setSort({ key, direction: PaymentsSortDirection.ASC })
      setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)

      return
    }

    if (sort.direction === PaymentsSortDirection.ASC) {
      setSort({ key, direction: PaymentsSortDirection.DESC })
      setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)

      return
    }

    setSort({ key: null, direction: null })
    setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)
  }

  const handlePageChange = (page: number) => setPageNumber(page)

  const handleItemsPerPageChange = (size: number) => {
    setPageSize(size)
    setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)
  }

  return {
    payments,
    sort,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
  }
}
