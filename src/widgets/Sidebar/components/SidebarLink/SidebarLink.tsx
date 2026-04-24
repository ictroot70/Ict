import type { MouseEvent, ReactNode } from 'react'

import { clsx } from 'clsx'
import Link, { type LinkProps } from 'next/link'

import s from './SidebarLink.module.scss'

type SidebarLinkProps = {
  icon?: ReactNode
  activeIcon?: ReactNode
  active?: boolean
  disabled?: boolean
  href: LinkProps['href']
  className?: string
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export const SidebarLink = ({
  children,
  icon,
  activeIcon,
  active = false,
  disabled = false,
  className,
  href,
  onClick,
}: SidebarLinkProps) => {
  const displayIcon = active && activeIcon ? activeIcon : icon
  const linkClasses = clsx(s.link, active && s.active, disabled && s.disabled, className)

  const content = (
    <>
      {displayIcon}
      <span className={s.label}>{children}</span>
    </>
  )

  if (disabled) {
    return (
      <span
        className={linkClasses}
        role={'link'}
        aria-disabled={'true'}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </span>
    )
  }

  return (
    <Link
      className={linkClasses}
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </Link>
  )
}

SidebarLink.displayName = 'SidebarLink'
