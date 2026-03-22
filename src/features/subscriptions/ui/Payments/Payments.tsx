'use client'

import s from './Payments.module.scss'

import { Loading } from '@/shared/composites'
import { PaymentsTable } from './PaymentsTable'
import { Pagination, Typography } from '@/shared/ui'

import { usePaymentsTable } from '@/features/subscriptions/hooks'
import { PAYMENTS_PAGE_SIZE_OPTIONS } from '@/features/subscriptions/model'

export function Payments() {
  const { payments, sort, handleSort, handlePageChange, handleItemsPerPageChange } =
    usePaymentsTable()

  if (payments.isLoading) {
    return <Loading />
  }

  if (!payments.data?.items.length) {
    return (
      <Typography variant="h1" className={s.empty}>
        No payments yet
      </Typography>
    )
  }

  const { items, page, totalCount, pageSize: resolvedPageSize } = payments.data

  return (
    <div className={s.wrapper}>
      <PaymentsTable items={items} sort={sort} onSort={handleSort} />
      <Pagination
        currentPage={page}
        totalItems={totalCount}
        itemsPerPage={resolvedPageSize}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        pageSizeOptions={PAYMENTS_PAGE_SIZE_OPTIONS}
      />
    </div>
  )
}
