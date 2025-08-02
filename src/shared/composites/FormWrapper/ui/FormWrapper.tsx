'use client'

import { Card, Typography } from '@ictroot/ui-kit'
import { ReactNode } from 'react'

import s from './FormWrapper.module.scss'

type Props = {
  title: string
  children: ReactNode
}

export function FormWrapper({ title, children }: Props) {
  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title} asChild>
        <h2>{title}</h2>
      </Typography>
      {children}
    </Card>
  )
}
