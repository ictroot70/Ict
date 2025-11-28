
/**
 * Component for post actions with different variants depending on context
 *
 * IMPORTANT: The current implementation with the `variant` prop is a temporary solution.
 *
 * PROBLEM: Post opening occurs without routing changes (for example, via query parameters:
 * /profile/123?postId=456), which makes it impossible to determine post ownership context at the URL level.
 *
 * PLANNED SOLUTION:
 * - Transition to determining context through route parameters (e.g., /post/:postId)
 * - Using global state or application context to determine access rights
 * - Integration with authorization system to verify post ownership
 *
 * Current variants:
 * - 'public' - public post without actions
 * - 'myPost' - actions for own post (edit, delete)
 * - 'userPost' - actions for another user's post (unfollow, copy link)
 */

import { ActionsMenu, ActionsMenuItem } from '@/shared/composites/ActionsMenu/ActionsMenu'
import { EditOutline, TrashOutline } from '@/shared/ui'
import { CopyOutline, PersonAddOutline } from '@ictroot/ui-kit'

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

  let currentItems: ActionsMenuItem[] = variant === 'myPost' ? myPostActions : userPostActions

  return <ActionsMenu items={currentItems} />
}