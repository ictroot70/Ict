import { Button, Typography } from '@/shared/ui'

import s from './FollowListModal.module.scss'

type Props = {
  emptyText?: string
  onRetry?: () => void
  type: 'empty' | 'error' | 'loading'
}

export const FollowListFeedback = ({ emptyText, onRetry, type }: Props) => {
  if (type === 'loading') {
    return (
      <div className={s.state}>
        <Typography variant={'regular_16'}>Loading users...</Typography>
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className={s.state}>
        <Typography variant={'h3'}>Failed to load users</Typography>
        <Typography className={s.stateText} variant={'regular_14'}>
          Please try again.
        </Typography>
        <Button variant={'outlined'} onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={s.state}>
      <Typography variant={'h3'}>{emptyText}</Typography>
    </div>
  )
}
