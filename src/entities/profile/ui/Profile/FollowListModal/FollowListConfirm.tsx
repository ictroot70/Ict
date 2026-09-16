import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { Avatar } from '@/shared/composites'
import { Button, Modal, Typography } from '@/shared/ui'

import s from './FollowListModal.module.scss'

type Props = {
  isCloseDisabled?: boolean
  isPending: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
  user: UserFollowingFollowersViewModel
}

export const FollowListConfirm = ({
  isCloseDisabled = false,
  isPending,
  message,
  onCancel,
  onConfirm,
  open,
  title,
  user,
}: Props) => (
  <Modal
    open={open}
    onClose={isCloseDisabled ? () => {} : onCancel}
    modalTitle={title}
    className={s.confirmModal}
  >
    <div className={s.confirmBody}>
      <Avatar className={s.confirmAvatar} image={user.avatars?.[0]?.url} alt={user.userName} />
      <Typography className={s.confirmText} variant={'regular_16'}>
        {message} <span className={s.confirmUserName}>“{user.userName}”</span>?
      </Typography>
    </div>
    <div className={s.confirmActions}>
      <Button
        className={s.confirmButton}
        disabled={isPending}
        variant={'outlined'}
        onClick={onConfirm}
      >
        Yes
      </Button>
      <Button
        className={s.confirmButton}
        disabled={isPending}
        variant={'primary'}
        onClick={onCancel}
      >
        No
      </Button>
    </div>
  </Modal>
)
