import Image from 'next/image'
import { TableRow, TableHeaderCell } from '../Table'

export type Sort = {
  key: string
  direction: 'asc' | 'desc' | null
}

export type Column = {
  key: string
  title: React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

type Props = {
  columns: Column[]
  sort: Sort
  onSortChange?: (sort: Sort) => void
}

export const TableHeaderRow = ({ columns, sort, onSortChange }: Props) => {
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable || !onSortChange) return

    if (!sort || sort.key !== key) {
      onSortChange({ key, direction: 'asc' })
      return
    }

    if (sort.direction === 'asc') {
      onSortChange({ key, direction: 'desc' })
      return
    }

    if (sort.direction === 'desc') {
      onSortChange({ key, direction: null })
      return
    }
  }

  return (
    <TableRow>
      {columns.map(column => {
        const isActive = sort?.key === column.key
        return (
          <TableHeaderCell key={column.key} scope="col">
            {column.sortable ? (
              <button
                type="button"
                onClick={() => handleSort(column.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {column.title}
                <SortIcon direction={isActive ? sort?.direction : null} />
              </button>
            ) : (
              <span>{column.title}</span>
            )}
          </TableHeaderCell>
        )
      })}
    </TableRow>
  )
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
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
