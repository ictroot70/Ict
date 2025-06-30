'use client'

import { ReactNode } from 'react'
import s from './FormWrapper.module.scss'
import { Card, Typography } from '@/shared'

type Props = {
  title: string
  children: ReactNode
}

export default function FormWrapper({ title, children }: Props) {
  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title}>
        <h2>{title}</h2>
      </Typography>
      {children}
    </Card>
  )
}
