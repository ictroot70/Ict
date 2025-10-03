/** @prettier */

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
        href: `${APP_ROUTES.PROFILE.MY('2936')}`,
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

export { linkGroups }
