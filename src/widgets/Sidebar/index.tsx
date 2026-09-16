'use client'
import { useCallback, useMemo, type MouseEvent } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import s from './Sidebar.module.scss'

import { useMessengerUnreadIndicator } from '../messenger/model'
import { SidebarGroup, SidebarLink } from './components'
import { LogOutButton } from './components/LogoutButton/LogOutButton'
import { useLinkGroups, type SidebarLinkItem } from './model/useLinkGroups'

export const Sidebar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const linkGroupsData = useLinkGroups()
  const { unreadCount: messengerUnreadCount } = useMessengerUnreadIndicator()

  const action = searchParams.get('action')
  const isCreateModalOpen = action === 'create'

  const queryObject = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])

  const handleModalLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, modalAction: string) => {
      event.preventDefault()
      const params = new URLSearchParams(searchParams.toString())

      params.set('action', modalAction)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const getLinkHref = useCallback(
    (link: SidebarLinkItem) => {
      if (!link.modalAction) {
        return link.href
      }

      return {
        pathname,
        query: {
          ...queryObject,
          action: link.modalAction,
        },
      }
    },
    [pathname, queryObject]
  )

  const isLinkActive = useCallback(
    (link: SidebarLinkItem) => {
      if (link.modalAction) {
        return action === link.modalAction
      }

      return !isCreateModalOpen && (link.href === pathname || pathname.startsWith(`${link.href}/`))
    },
    [action, isCreateModalOpen, pathname]
  )

  const getLinkClickHandler = useCallback(
    (link: SidebarLinkItem) => {
      if (!link.modalAction) {
        return undefined
      }

      return (event: MouseEvent<HTMLAnchorElement>) =>
        handleModalLinkClick(event, link.modalAction!)
    },
    [handleModalLinkClick]
  )

  if (!linkGroupsData) {
    return null
  }

  const { linkGroups } = linkGroupsData

  return (
    <nav className={s.sidebar}>
      <div className={s.sidebar__content}>
        {linkGroups.map((group, index) => (
          <SidebarGroup key={index}>
            {group.links.map(link => (
              <SidebarLink
                key={link.modalAction ?? link.href}
                href={getLinkHref(link)}
                icon={link.icon}
                activeIcon={link.activeIcon}
                indicator={
                  link.href === '/messenger' && messengerUnreadCount > 0 ? (
                    <span
                      className={s.unreadDot}
                      aria-label={`${messengerUnreadCount} unread messenger messages`}
                      title={`${messengerUnreadCount} unread messenger messages`}
                    />
                  ) : undefined
                }
                disabled={link.disabled}
                active={isLinkActive(link)}
                onClick={getLinkClickHandler(link)}
              >
                {link.label}
              </SidebarLink>
            ))}
          </SidebarGroup>
        ))}
        <LogOutButton />
      </div>
    </nav>
  )
}

export { SidebarSkeleton } from './components/SidebarSkeleton'
