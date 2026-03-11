import { ActionsMenu, ActionsMenuItem } from '@/shared/composites'
import { EditOutline, TrashOutline, CopyOutline, PersonAddOutline } from '@/shared/ui'

export function PostActions() {
  const variant = 'myPost' //TODO:Need change!

  const myPostActions: ActionsMenuItem[] = [
    {
      label: 'Edit Post',
      icon: <EditOutline />,
      onClick: () => {},
    },
    {
      label: 'Delete Post',
      icon: <TrashOutline />,
      onClick: () => {},
    },
  ]

  const userPostActions: ActionsMenuItem[] = [
    {
      label: 'Follow',
      icon: <PersonAddOutline />,
      onClick: () => {},
    },
    {
      label: 'Copy Link',
      icon: <CopyOutline />,
      onClick: () => {},
    },
  ]

  const currentItems: ActionsMenuItem[] = variant === 'myPost' ? myPostActions : userPostActions

  return <ActionsMenu items={currentItems} />
}
