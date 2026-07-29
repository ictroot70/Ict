'use client'
import { UserMetadata } from '@/shared/types'
import { Typography } from '@/shared/ui'

import s from './ProfileStats.module.scss'

export type ProfileStatsType = 'following' | 'followers'

type Props = {
  onStatClick?: (type: ProfileStatsType) => void
  stats: UserMetadata
}

export const ProfileStats = ({ onStatClick, stats }: Props) => {
  const { following, followers, publications } = stats

  const statsData = [
    { label: 'Following', value: following, type: 'following' as const },
    { label: 'Followers', value: followers, type: 'followers' as const },
    { label: 'Publications', value: publications, type: null },
  ]

  return (
    <ul className={s.stats}>
      {statsData.map(({ label, type, value }) => (
        <li key={label}>
          {type ? (
            <button className={s.statButton} type={'button'} onClick={() => onStatClick?.(type)}>
              <Typography variant={'bold_14'}>{value}</Typography>
              <Typography variant={'regular_14'}>{label}</Typography>
            </button>
          ) : (
            <div className={s.statStatic}>
              <Typography variant={'bold_14'}>{value}</Typography>
              <Typography variant={'regular_14'}>{label}</Typography>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
