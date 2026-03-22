import type { AriaAttributes, ReactNode } from 'react'

import Image from 'next/image'

import s from './SortableHeaderCell.module.scss'

import { TableHeaderCell } from '../Table'

type Props<T extends string> = {
  title: ReactNode
  columnKey: T
  activeKey?: T
  direction: 'asc' | 'desc' | null
  onSort: (key: T) => void
  className?: string
}

export function SortableHeaderCell<T extends string>({
  title,
  columnKey,
  activeKey,
  direction,
  onSort,
  className,
}: Props<T>) {
  const isActive = activeKey === columnKey
  const iconDirection = isActive ? direction : null

  let ariaSort: AriaAttributes['aria-sort'] = 'none'

  if (isActive && direction === 'asc') {
    ariaSort = 'ascending'
  }

  if (isActive && direction === 'desc') {
    ariaSort = 'descending'
  }

  return (
    <TableHeaderCell className={className} scope={'col'} aria-sort={ariaSort}>
      <button type={'button'} onClick={() => onSort(columnKey)} className={s.button}>
        {title}
        <SortIcon direction={iconDirection} />
      </button>
    </TableHeaderCell>
  )
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span className={s.icon}>
      {direction ? (
        <Image src={`/${direction}.svg`} alt={''} aria-hidden width={8} height={6} />
      ) : (
        <Image src={'/unsorted.svg'} alt={''} aria-hidden width={8} height={12} />
      )}
    </span>
  )
}
