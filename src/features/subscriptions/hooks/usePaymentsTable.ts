import { useMemo, useState } from 'react'

import { useGetPaymentsQuery } from '@/features/subscriptions/api'
import { PaymentsSortBy, PaymentsSortDirection } from '@/shared/types'

type SortState = {
  key: PaymentsSortBy | null
  direction: PaymentsSortDirection | null
}

export function usePaymentsTable() {
  const [sort, setSort] = useState<SortState>({
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

  const query = useMemo(
    () => (sort.key && sort.direction ? { sortBy: sort.key, sortDirection: sort.direction } : {}),
    [sort]
  )

  const payments = useGetPaymentsQuery(query)

  return { payments, sort, handleSort }
}
