import { Typography } from '@/shared/ui'

import s from './FeedEmptyState.module.scss'

export function FeedEmptyState() {
  return (
    <div className={s.wrapper}>
      <Typography variant={'h1'}>No posts from your subscriptions yet</Typography>
      <Typography variant={'regular_16'}>Follow someone to see their posts here</Typography>
    </div>
  )
}
