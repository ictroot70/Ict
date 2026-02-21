import { ActionsMenu, ActionsMenuItem } from '@/shared/composites'
import { EditOutline, TrashOutline, CopyOutline, PersonAddOutline } from '@/shared/ui'

type Props = {
  variant: 'myPost' | 'userPost'
  onEdit?: () => void
  onDelete?: () => void
  onFollow?: () => void
  onCopyLink?: () => void
}

export default function PostActions({ variant, onEdit, onDelete, onFollow, onCopyLink }: Props) {
  const myPostActions: ActionsMenuItem[] = [
    {
      label: 'Edit Post',
      icon: <EditOutline />,
      onClick: () => onEdit?.(),
    },
    {
      label: 'Delete Post',
      icon: <TrashOutline />,
      onClick: () => onDelete?.(),
    },
  ]

  const userPostActions: ActionsMenuItem[] = [
    {
      label: 'Follow',
      icon: <PersonAddOutline />,
      onClick: () => onFollow?.(),
    },
    {
      label: 'Copy Link',
      icon: <CopyOutline />,
      onClick: () => onCopyLink?.(),
    },
  ]

  const currentItems: ActionsMenuItem[] = variant === 'myPost' ? myPostActions : userPostActions

  return <ActionsMenu items={currentItems} />
}
