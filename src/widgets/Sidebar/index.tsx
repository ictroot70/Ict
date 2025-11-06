import { SidebarGroup, SidebarLink } from './components'
import { useLinkGroups } from './model/useLinkGroups'
import { usePathname } from 'next/navigation'

import s from './Sidebar.module.scss'
import { LogOutButton } from './components/LogoutButton/LogOutButton'

export const Sidebar = () => {
  const pathname = usePathname()
  const linkGroupsData = useLinkGroups()

  if (!linkGroupsData) return null

  const { linkGroups } = linkGroupsData

  return (
    <nav className={s.sidebar}>
      <div className={s.sidebar__content}>
        {linkGroups.map((group, index) => (
          <SidebarGroup key={index}>
            {group.links.map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                activeIcon={link.activeIcon}
                disabled={link.disabled}
                active={link.href === pathname}
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
