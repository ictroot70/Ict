import { Skeleton } from '@/shared/composites'
import { ThemeVariant, themeVariant } from '@/shared/composites/Skeleton/lib/skeleton.theme'

import s from './AvaSkeleton.module.scss'

export const AvatarSkeleton = ({ variant = themeVariant.DEFAULT }: { variant?: ThemeVariant }) => (
  <div className={s.container}>
    <Skeleton variant={variant} className={s.avatar} />
    <Skeleton variant={variant} className={s.button} />
  </div>
)
