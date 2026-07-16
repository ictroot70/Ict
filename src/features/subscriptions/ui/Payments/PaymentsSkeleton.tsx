import { Skeleton } from '@/shared/composites'

import s from './Payments.module.scss'

const COLUMN_COUNT = 5
const ROW_COUNT = 6

export function PaymentsSkeleton() {
  return (
    <div className={s.wrapper} aria-label={'Loading payments'}>
      <div className={s.skeletonTable}>
        <div className={s.skeletonHeader}>
          {Array.from({ length: COLUMN_COUNT }, (_, index) => (
            <Skeleton className={s.skeletonHeaderCell} key={index} />
          ))}
        </div>

        {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
          <div className={s.skeletonRow} key={rowIndex}>
            {Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => (
              <Skeleton className={s.skeletonCell} key={columnIndex} />
            ))}
          </div>
        ))}
      </div>

      <div className={s.skeletonPagination}>
        <Skeleton className={s.skeletonPageSize} />
        <Skeleton className={s.skeletonPages} />
      </div>
    </div>
  )
}
