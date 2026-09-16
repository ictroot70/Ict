'use client'

import s from './LinearProgress.module.scss'

type Props = {
  active: boolean
}

export const LinearProgress = ({ active }: Props) => {
  return (
    <div className={s.wrapper}>
      <div className={`${s.track} ${active ? s.active : ''}`}>
        {active && <div className={s.indicator} />}
      </div>
    </div>
  )
}
