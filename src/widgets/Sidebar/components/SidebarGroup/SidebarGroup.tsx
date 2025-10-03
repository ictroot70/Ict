import clsx from 'clsx'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
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
