import { useMemo, useState } from 'react'

import { useGetPaymentsQuery } from '@/features/subscriptions/api'
import {
  PaymentsSortBy,
  PaymentsSortDirection,
  SubscriptionType,
  PaymentType,
} from '@/shared/types'

type SortState = { key: PaymentsSortBy; direction: PaymentsSortDirection | null }

export function usePaymentsTable() {
  const [sort, setSort] = useState<SortState>({
    key: PaymentsSortBy.END_DATE,
    direction: PaymentsSortDirection.DESC,
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

    setSort({ key, direction: null })
  }

  const query = useMemo(
    () => (sort.direction ? { sortBy: sort.key, sortDirection: sort.direction } : {}),
    [sort]
  )

  const payments = useGetPaymentsQuery(query)

  /* MOCK DATA */

  const mockItems = [
    {
      userId: 1,
      subscriptionId: 's1',
      dateOfPayment: '2026-03-10T00:00:00.000Z',
      endDateOfSubscription: '2026-04-10T00:00:00.000Z',
      price: 10,
      subscriptionType: SubscriptionType.DAY,
      paymentType: PaymentType.STRIPE,
    },
    {
      userId: 1,
      subscriptionId: 's2',
      dateOfPayment: '2026-02-10T00:00:00.000Z',
      endDateOfSubscription: '2026-03-10T00:00:00.000Z',
      price: 50,
      subscriptionType: SubscriptionType.WEEKLY,
      paymentType: PaymentType.PAYPAL,
    },
    {
      userId: 1,
      subscriptionId: 's3',
      dateOfPayment: '2026-01-10T00:00:00.000Z',
      endDateOfSubscription: '2026-02-10T00:00:00.000Z',
      price: 100,
      subscriptionType: SubscriptionType.MONTHLY,
      paymentType: PaymentType.CREDIT_CARD,
    },
  ]

  const sortMock = (list: typeof mockItems) => {
    if (!sort.direction) return list
    const dir = sort.direction === 'asc' ? 1 : -1

    return [...list].sort((a, b) => {
      const key = sort.key
      const left = a[key as keyof typeof a]
      const right = b[key as keyof typeof b]

      if (left === right) return 0
      return left > right ? dir : -dir
    })
  }

  return { payments, sort, handleSort, mockItems, sortMock }
}
