'use client'

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/shared/composites/Table'
import { TableHeaderRow } from '@/shared/composites/Table/TableHeaderRow/TableHeaderRow'
import { useState } from 'react'

export type PaymentsSortBy = 'dateOfPayment' | 'endDate' | 'price' | 'paymentType' | 'createdAt'

const columns = [
  {
    key: 'dateOfPayment',
    title: 'Date of payment',
    sortable: true,
  },
  {
    key: 'endDate',
    title: 'End date',
    sortable: true,
  },
  {
    key: 'price',
    title: 'Price',
    sortable: true,
    align: 'right' as const,
  },
  {
    key: 'subscriptionType',
    title: 'Subscription',
  },
  {
    key: 'paymentType',
    title: 'Payment',
  },
]

export const mockPayments = {
  totalCount: 10,
  pagesCount: 1,
  page: 1,
  pageSize: 12,
  items: [
    {
      userId: 1,
      subscriptionId: 'sub_001',
      dateOfPayment: '2026-03-10T10:15:30.000Z',
      endDateOfSubscription: '2026-04-10T10:15:30.000Z',
      price: 10,
      subscriptionType: 'MONTHLY',
      paymentType: 'STRIPE',
    },
    {
      userId: 1,
      subscriptionId: 'sub_002',
      dateOfPayment: '2026-02-10T08:22:10.000Z',
      endDateOfSubscription: '2026-03-10T08:22:10.000Z',
      price: 10,
      subscriptionType: 'MONTHLY',
      paymentType: 'STRIPE',
    },
    {
      userId: 1,
      subscriptionId: 'sub_003',
      dateOfPayment: '2026-01-10T14:05:00.000Z',
      endDateOfSubscription: '2026-02-10T14:05:00.000Z',
      price: 10,
      subscriptionType: 'MONTHLY',
      paymentType: 'STRIPE',
    },
    {
      userId: 1,
      subscriptionId: 'sub_004',
      dateOfPayment: '2025-12-10T09:40:15.000Z',
      endDateOfSubscription: '2026-01-10T09:40:15.000Z',
      price: 10,
      subscriptionType: 'MONTHLY',
      paymentType: 'STRIPE',
    },
    {
      userId: 1,
      subscriptionId: 'sub_005',
      dateOfPayment: '2025-11-10T12:12:45.000Z',
      endDateOfSubscription: '2025-12-10T12:12:45.000Z',
      price: 10,
      subscriptionType: 'MONTHLY',
      paymentType: 'STRIPE',
    },
  ],
}

export function Payments() {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{
    key: PaymentsSortBy
    direction: 'asc' | 'desc'
  }>({
    key: 'endDate',
    direction: 'desc',
  })

  return (
    <Table>
      <TableHead>
        <TableHeaderRow
          columns={columns}
          sort={sort}
          onSortChange={newSort => {
            if (!newSort) return

            setSort({
              key: newSort.key as PaymentsSortBy,
              direction: newSort.direction ?? 'asc',
            })

            setPage(1)
          }}
        />
      </TableHead>

      <TableBody>
        {mockPayments?.items.map(payment => (
          <TableRow key={payment.subscriptionId}>
            <TableCell>{new Date(payment.dateOfPayment).toLocaleDateString()}</TableCell>

            <TableCell>{new Date(payment.endDateOfSubscription).toLocaleDateString()}</TableCell>

            <TableCell>{payment.price}$</TableCell>

            <TableCell>{payment.subscriptionType}</TableCell>

            <TableCell>{payment.paymentType}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
