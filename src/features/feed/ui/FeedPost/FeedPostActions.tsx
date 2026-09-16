import { ActionsMenu, ActionsMenuItem } from '@/shared/composites'
import { CopyOutline, PersonAddOutline, PersonRemoveOutline } from '@/shared/ui'

type Props = {
  isFollowing: boolean
  isPending: boolean
  onCopyLink: () => void
  onToggleFollow: () => void
}

export function FeedPostActions({ isFollowing, isPending, onCopyLink, onToggleFollow }: Props) {
  const items: ActionsMenuItem[] = [
    {
      label: isFollowing ? 'Unfollow' : 'Follow',
      icon: isFollowing ? <PersonRemoveOutline /> : <PersonAddOutline />,
      onClick: onToggleFollow,
      disabled: isPending,
    },
    {
      label: 'Copy Link',
      icon: <CopyOutline />,
      onClick: onCopyLink,
    },
  ]

  return <ActionsMenu items={items} />
}
