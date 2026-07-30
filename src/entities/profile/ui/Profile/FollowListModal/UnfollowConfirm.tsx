import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { Avatar } from '@/shared/composites'
import { Button, Typography } from '@/shared/ui'

import s from './FollowListModal.module.scss'

type Props = {
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
  user: UserFollowingFollowersViewModel
}

export const UnfollowConfirm = ({ isPending, onCancel, onConfirm, user }: Props) => (
  <div className={s.confirmOverlay}>
    <div
      aria-labelledby={'unfollow-confirm-title'}
      aria-modal={'true'}
      className={s.confirmModal}
      role={'dialog'}
    >
      <div className={s.confirmHeader}>
        <Typography className={s.confirmTitle} id={'unfollow-confirm-title'} variant={'h2'}>
          Unfollow
        </Typography>
        <button
          aria-label={'Close confirmation'}
          className={s.confirmCloseButton}
          type={'button'}
          onClick={onCancel}
        >
          ×
        </button>
      </div>
      <div className={s.confirmBody}>
        <Avatar className={s.confirmAvatar} image={user.avatars?.[0]?.url} alt={user.userName} />
        <Typography className={s.confirmText} variant={'regular_16'}>
          Do you really want to Unfollow from this user{' '}
          <span className={s.confirmUserName}>“{user.userName}”</span>?
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
    </div>
  </div>
)
