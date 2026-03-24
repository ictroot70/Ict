'use client'

import React from 'react'
import { usePaymentsTable } from '@/features/subscriptions/hooks'
import { PAYMENTS_PAGE_SIZE_OPTIONS } from '@/features/subscriptions/model'
import { Loading } from '@/shared/composites'
import { Pagination, Typography } from '@/shared/ui'

import s from './Payments.module.scss'

import { PaymentsTable } from './PaymentsTable'

export function Payments() {
  const { payments, sort, handleSort, handlePageChange, handleItemsPerPageChange } =
    usePaymentsTable()

  if (payments.isLoading) {
    return <Loading />
  }

  if (payments.isError) {
    return (
      <div className={s.state}>
        <Typography variant={'h1'}>{'Failed to load payments'}</Typography>
      </div>
    )
  }

  const data = payments.data

  if (!data || data.items.length === 0) {
    return (
      <div className={s.state}>
        <Typography variant={'h1'}>{'No payments yet'}</Typography>
      </div>
    )
  }

  const { items, page, totalCount, pageSize } = data

  return (
    <div className={s.wrapper}>
      <PaymentsTable items={items} sort={sort} onSort={handleSort} />
      <Pagination
        currentPage={page}
        totalItems={totalCount}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        pageSizeOptions={PAYMENTS_PAGE_SIZE_OPTIONS}
      />
    </div>
  )
}
