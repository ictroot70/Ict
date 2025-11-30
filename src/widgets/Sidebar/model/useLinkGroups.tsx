/** @prettier */

import { ReactElement } from 'react'

import { useAuth } from '@/features/posts/utils/useAuth'
import { APP_ROUTES } from '@/shared/constant'
import {
  Bookmark,
  BookmarkOutline,
  Home,
  HomeOutline,
  MessageCircle,
  MessageCircleOutline,
  Person,
  PersonOutline,
  PlusSquare,
  PlusSquareOutline,
  Search,
  TrendingUp,
} from '@/shared/ui'

export type SidebarLinkItem = {
  href: string
  icon: ReactElement
  activeIcon: ReactElement
  label: string
  disabled?: boolean
  modalAction?: string
}

export type SidebarLinkGroup = {
  links: SidebarLinkItem[]
}

export const useLinkGroups = (): { linkGroups: SidebarLinkGroup[] } | null => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const linkGroups: SidebarLinkGroup[] = [
    {
      links: [
        {
          href: '/feed',
          icon: <HomeOutline />,
          activeIcon: <Home />,
          label: 'Feed',
        },
        {
          href: '/create',
          modalAction: 'create',
          icon: <PlusSquareOutline />,
          activeIcon: <PlusSquare />,
          label: 'Create',
        },
        {
          href: `${APP_ROUTES.PROFILE.ID(user.userId)}`,
          icon: <PersonOutline />,
          activeIcon: <Person />,
          label: 'My Profile',
        },
        {
          href: '/messenger',
          icon: <MessageCircleOutline />,
          activeIcon: <MessageCircle />,
          label: 'Messenger',
        },
        {
          href: '/search',
          icon: <Search />,
          activeIcon: <Search />,
          label: 'Search',
        },
      ],
    },
    {
      links: [
        {
          href: '/statistics',
          icon: <TrendingUp />,
          activeIcon: <TrendingUp />,
          label: 'Statistics',
          disabled: true,
        },
        {
          href: '/favorites',
          icon: <BookmarkOutline />,
          activeIcon: <Bookmark />,
          label: 'Favorites',
        },
      ],
    },
  ]

  return { linkGroups }
}
