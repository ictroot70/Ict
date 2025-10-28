import { ActionsMenu, ActionsMenuItem } from '@/shared/composites/ActionsMenu/ActionsMenu'
import { EditOutline, TrashOutline } from '@/shared/ui'

export default function PostActions() {
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

  return <ActionsMenu items={myPostActions} />
}
