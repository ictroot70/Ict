'use client'

import { useMemo } from 'react'

import { usePaymentsTable } from '@/features/subscriptions/hooks'
import { mapPaymentTypeToLabel, mapSubscriptionTypeToLabel } from '@/features/subscriptions/model'
import { PaymentsSortBy } from '@/shared/types'

import s from './Payments.module.scss'

import {
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableHeaderCell,
  SortableHeaderCell,
} from '@/shared/composites/Table'

import { Typography } from '@/shared/ui'
import { Loading } from '@/shared/composites'
import { formatDate, formatPrice } from '@/shared/lib/formatters'
import { Pagination } from '@ictroot/ui-kit'

const columns = [
  { id: 'dateOfPayment', title: 'Date of payment', sortKey: PaymentsSortBy.DATE_OF_PAYMENT },
  { id: 'endDate', title: 'End date', sortKey: PaymentsSortBy.END_DATE },
  { id: 'price', title: 'Price', sortKey: PaymentsSortBy.PRICE },
  { id: 'subscriptionType', title: 'Subscription Type' },
  { id: 'paymentType', title: 'Payment Type', sortKey: PaymentsSortBy.PAYMENT_TYPE },
]

export function Payments() {
  const {
    payments,
    sort,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    pageNumber,
    pageSize,
  } = usePaymentsTable()

  const items = useMemo(() => payments.data?.items ?? [], [payments.data?.items, sort])

  if (payments.isLoading) {
    return <Loading />
  }

  if (items.length === 0) {
    return <Typography variant={'h1'}>No payments yet</Typography>
  }

  return (
    <div className={s.wrapper}>
      <div className={s.tableArea}>
        <Table className={s.table}>
          <TableHead>
            <TableRow>
              {columns.map(column =>
                column.sortKey ? (
                  <SortableHeaderCell
                    key={column.id}
                    columnKey={column.sortKey}
                    title={column.title}
                    activeKey={sort.key ?? undefined}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                ) : (
                  <TableHeaderCell key={column.id} scope="col">
                    {column.title}
                  </TableHeaderCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody className={s.tableArea}>
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
      </div>
      <Pagination
        currentPage={payments.data?.page ?? pageNumber}
        totalItems={payments.data?.totalCount ?? 0}
        itemsPerPage={payments.data?.pageSize ?? pageSize}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        pageSizeOptions={[8, 16, 24]}
      />
    </div>
  )
}
