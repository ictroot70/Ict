import { ComponentPropsWithoutRef, ReactNode } from 'react'

import { clsx } from 'clsx'

import s from './SidebarGroup.module.scss'

type Props = {
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<'div'>

export const SidebarGroup = ({ children, className, ...rest }: Props) => {
  return (
    <div className={clsx(s.group, className)} {...rest}>
      {children}
    </div>
  )
}
