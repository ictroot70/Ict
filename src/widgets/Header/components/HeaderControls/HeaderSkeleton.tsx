'use client'
import { Skeleton } from '@/shared/composites'

import s from './HeaderSkeleton.module.scss'

export const HeaderSkeleton = () => {
  return <Skeleton className={s.header__controls} />
}
