import {
  PaymentsSortState,
  mapPaymentTypeToLabel,
  mapSubscriptionTypeToLabel,
} from '@/features/subscriptions/model'
import {
  SortableHeaderCell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/composites/Table'
import { formatDate, formatPrice } from '@/shared/lib/formatters'
import { PaymentsSortBy, PaymentsViewModel } from '@/shared/types'

import s from './PaymentsTable.module.scss'

type Column = {
  id: string
  title: string
  sortKey?: PaymentsSortBy
}

const columns: Column[] = [
  { id: 'dateOfPayment', title: 'Date of payment', sortKey: PaymentsSortBy.DATE_OF_PAYMENT },
  { id: 'endDate', title: 'End date', sortKey: PaymentsSortBy.END_DATE },
  { id: 'price', title: 'Price', sortKey: PaymentsSortBy.PRICE },
  { id: 'subscriptionType', title: 'Subscription Type' },
  { id: 'paymentType', title: 'Payment Type', sortKey: PaymentsSortBy.PAYMENT_TYPE },
]

type Props = {
  sort: PaymentsSortState
  items: PaymentsViewModel[]
  onSort: (key: PaymentsSortBy) => void
}

export function PaymentsTable({ items, sort, onSort }: Props) {
  return (
    <div className={s.wrapper}>
      <Table>
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
                  onSort={onSort}
                />
              ) : (
                <TableHeaderCell key={column.id} scope={'col'}>
                  {column.title}
                </TableHeaderCell>
              )
            )}
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
    </div>
  )
}
