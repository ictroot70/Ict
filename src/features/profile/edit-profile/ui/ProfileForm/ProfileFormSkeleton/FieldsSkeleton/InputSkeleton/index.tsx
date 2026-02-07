import { Skeleton } from '@/shared/composites/Skeleton'
import { ThemeVariant, themeVariant } from '@/shared/composites/Skeleton/lib/skeleton.theme'

import s from './InputSkeleton.module.scss'
export const InputSkeleton = ({ variant = themeVariant.DEFAULT }: { variant?: ThemeVariant }) => (
  <div className={s.container}>
    <Skeleton variant={variant} className={s.label} />
    <Skeleton variant={variant} className={s.input} />
  </div>
)
