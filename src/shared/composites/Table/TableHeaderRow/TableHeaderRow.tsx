import Image from 'next/image'
import { TableRow, TableHeader } from '../Table'

export type Sort = {
  key: string
  direction: 'asc' | 'desc'
} | null

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
      onSortChange(null)
      return
    }
  }

  return (
    <TableRow>
      {columns.map(column => {
        const isActive = sort?.key === column.key

        return (
          <TableHeader
            scope="col"
            key={column.key}
            onClick={() => handleSort(column.key, column.sortable)}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {column.title}

              {column.sortable && (
                <span
                  style={{
                    display: 'inline-flex',
                  }}
                >
                  {!isActive && (
                    <Image src="/noActiveFilter.svg" alt="no filter" width={8} height={12} />
                  )}

                  {isActive && sort?.direction === 'asc' && (
                    <Image src="/asc.svg" alt="asc" width={8} height={6} />
                  )}

                  {isActive && sort?.direction === 'desc' && (
                    <Image src="/desc.svg" alt="desc" width={8} height={6} />
                  )}
                </span>
              )}
            </span>
          </TableHeader>
        )
      })}
    </TableRow>
  )
}
