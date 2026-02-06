import { ComponentProps } from 'react'

import s from './Skeleton.module.scss'

import { themeVariant, ThemeVariant } from './lib/skeleton.theme'

type SkeletonProps = Omit<ComponentProps<'div'>, 'style'> & {
  variant?: ThemeVariant
}

export const Skeleton = ({
  variant = themeVariant.DEFAULT,
  className,
  ...props
}: SkeletonProps) => {
  return (
    <div {...props} className={[s.skeleton, s[variant], className].filter(Boolean).join(' ')} />
  )
}
