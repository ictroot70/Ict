'use client'

import { ReactElement, ReactNode } from 'react'

import { APP_ROUTES } from '@/shared/constant/app-routes'
import { ArrowBack, Button, Typography } from '@/shared/ui'
import { useRouter } from 'next/navigation'

import s from './InfoPage.module.scss'

type Props = {
  title: string
  children: ReactNode
  backButtonText?: string
  link?: string
}

export const InfoPage = ({
  title,
  children,
  backButtonText = 'Back',
  link,
}: Props): ReactElement => {
  const router = useRouter()

  const handleBack = () => {
    try {
      link ? router.push(link) : router.back()
    } catch {
      router.push(APP_ROUTES.ROOT)
    }
  }

  return (
    <div className={s.wrapper}>
      <Button variant={'text'} onClick={handleBack} className={s.link} aria-label={'Go back'}>
        <ArrowBack />
        <Typography variant={'regular_14'}>{backButtonText}</Typography>
      </Button>

      <div className={s.content}>
        <Typography variant={'h1'} asChild>
          <h2>{title}</h2>
        </Typography>
        {children}
      </div>
    </div>
  )
}
