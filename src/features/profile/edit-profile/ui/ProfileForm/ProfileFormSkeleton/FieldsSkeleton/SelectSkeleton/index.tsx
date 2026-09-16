import { Skeleton } from '@/shared/composites'
import { ThemeVariant, themeVariant } from '@/shared/composites/Skeleton/lib/skeleton.theme'

import s from './SelectSkeleton.module.scss'

export const SelectSkeleton = ({ variant = themeVariant.DEFAULT }: { variant?: ThemeVariant }) => (
  <div className={s.container}>
    <Skeleton variant={variant} className={s.label} />
    <Skeleton variant={variant} className={s.select} />
  </div>
)
