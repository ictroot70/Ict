'use client'

import s from './InfoPage.module.scss'
import { ArrowBack, Button, Typography } from '@ictroot/ui-kit'
import { useRouter } from 'next/navigation'

type Props = {
  title: string
  children: React.ReactNode
  backButtonText?: string
}

export const InfoPage: React.FC<Props> = ({ title, children, backButtonText = 'Back' }) => {
  const router = useRouter()

  const handleBack = () => {
    try {
      router.back()
    } catch {
      router.push('/')
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
