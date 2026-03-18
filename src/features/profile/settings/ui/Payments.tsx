'use client'

import { useMemo } from 'react'

import { PaymentsSortBy } from '@/shared/types'
import { usePaymentsTable } from '@/features/subscriptions/hooks'
import { mapPaymentTypeToLabel, mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  SortableHeaderCell,
} from '@/shared/composites/Table'

import { Typography } from '@/shared/ui'
import { formatDate, formatPrice } from '@/shared/lib/formatters'

const columns = [
  { key: PaymentsSortBy.DATE_OF_PAYMENT, title: 'Date of payment', sortable: true },
  { key: PaymentsSortBy.END_DATE, title: 'End date', sortable: true },
  { key: PaymentsSortBy.PRICE, title: 'Price', sortable: true },
  { key: PaymentsSortBy.CREATED_AT, title: 'Subscription Type', sortable: true },
  { key: PaymentsSortBy.PAYMENT_TYPE, title: 'Payment Type', sortable: true },
]

export function Payments() {
  const { payments, sort, handleSort } = usePaymentsTable()

  const items = useMemo(() => payments.data?.items ?? [], [payments.data?.items, sort])

  if (items.length === 0) {
    return <Typography variant={'h1'}>No payments yet</Typography>
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <SortableHeaderCell
              key={column.key}
              columnKey={column.key}
              title={column.title}
              sortable={column.sortable}
              activeKey={sort.key}
              direction={sort.direction}
              onSort={handleSort}
            />
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {items.map(item => (
          <TableRow key={item.subscriptionId}>
            <TableCell>{formatDate(item.dateOfPayment)}</TableCell>
            <TableCell>{formatDate(item.endDateOfSubscription)}</TableCell>
            <TableCell>{formatPrice(item.price)}</TableCell>
            <TableCell>{mapSubscriptionTypeToLabel(item.subscriptionType)}</TableCell>
            <TableCell>{mapPaymentTypeToLabel(item.paymentType)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
