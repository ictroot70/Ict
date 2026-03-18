import Image from 'next/image'
import { TableHeaderCell } from '../Table'
import s from './SortableHeaderCell.module.scss'

type SortDirection = 'asc' | 'desc' | null

type Props<T extends string> = {
  title: React.ReactNode
  sortable?: boolean
  columnKey: T
  activeKey?: T
  direction: SortDirection
  onSort?: (key: T) => void
  className?: string
}

export function SortableHeaderCell<T extends string>({
  title,
  sortable,
  columnKey,
  activeKey,
  direction,
  onSort,
  className,
}: Props<T>) {
  const isActive = activeKey === columnKey
  const iconDirection = isActive ? direction : null

  if (!sortable || !onSort) {
    return (
      <TableHeaderCell className={className} scope="col">
        {title}
      </TableHeaderCell>
    )
  }

  return (
    <TableHeaderCell className={className} scope="col">
      <button type="button" onClick={() => onSort(columnKey)} className={s.button}>
        {title}
        <SortIcon direction={iconDirection} />
      </button>
    </TableHeaderCell>
  )
}

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span>
      {direction ? (
        <Image src={`/${direction}.svg`} alt={direction} width={8} height={6} />
      ) : (
        <Image src="/unsorted.svg" alt="no filter" width={8} height={12} />
      )}
    </span>
  )
}
