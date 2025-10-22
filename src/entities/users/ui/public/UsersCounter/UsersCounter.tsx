/** @prettier */

'use client'
import { Card, Typography } from '@/shared/ui'

import s from './UsersCounter.module.scss'

type Props = {
  totalCount: number
  minLength?: number
}

export function UsersCounter({ totalCount, minLength = 6 }: Props) {
  const countStr = totalCount.toString()
  const digits = countStr.padStart(Math.max(minLength, countStr.length), '0').split('')

  return (
    <Card className={s.counter}>
      <Typography variant="h2">Registered users:</Typography>
      <Card className={s.counter__digits}>
        {digits.map((digit, index) => (
          <Typography key={index} variant={'h2'} className={s.counter__digit}>
            {digit}
          </Typography>
        ))}
      </Card>
    </Card>
  )
}
