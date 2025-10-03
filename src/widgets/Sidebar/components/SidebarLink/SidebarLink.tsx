import clsx from 'clsx'
import { ReactNode } from 'react'
import s from './SidebarLink.module.scss'
import Link from 'next/link'

type Props = {
  icon?: ReactNode
  activeIcon?: ReactNode
  active?: boolean
  disabled?: boolean
  href: string
  className?: string
  children: ReactNode
}

export const SidebarLink = ({
  children,
  icon,
  activeIcon,
  active,
  disabled,
  className,
  href,
  ...rest
}: Props) => {
  if (disabled) {
    return (
      <span className={`${s.link} ${s.disabled} ${className}`} role="link" aria-disabled="true">
        {active && activeIcon ? activeIcon : icon}
        <span className={s.label}>{children}</span>
      </span>
    )
  }

  return (
    <Link className={clsx(s.link, active && s.active, className)} href={href} {...rest}>
      {active && activeIcon ? activeIcon : icon}
      <span className={s.label}>{children}</span>
    </Link>
  )
}

SidebarLink.displayName = 'SidebarLink'
