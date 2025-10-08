/** @prettier */

import { useMeQuery } from '@/features/auth'
import { useAuth } from '@/features/posts/utils/useAuth'
import { APP_ROUTES } from '@/shared/constant'
import {
  TrendingUp,
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
} from '@/shared/ui'

export const useLinkGroups = () => {
  const { user } = useAuth()

  const linkGroups = [
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
          icon: <PlusSquareOutline />,
          activeIcon: <PlusSquare />,
          label: 'Create',
        },
        {
          href: `${APP_ROUTES.PROFILE.ID(`${user?.userId}`)}`,
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
