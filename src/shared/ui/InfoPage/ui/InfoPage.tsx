'use client'

import s from './InfoPage.module.scss'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { ArrowBack, Button, Typography } from '@/shared/ui'
import { useRouter } from 'next/navigation'

type Props = {
  title: string
  children: React.ReactNode
  backButtonText?: string
  link?: string
}

export const InfoPage: React.FC<Props> = ({ title, children, backButtonText = 'Back', link }) => {
  const router = useRouter()

  const handleBack = () => {
    try {
      link ? router.push(link) : router.back()
    } catch {
      router.push(APP_ROUTES.ROOT)
    }
  }
  return (
    <div className={s.container}>
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
    </div>
  )
}
