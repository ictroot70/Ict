'use client'
//import { useRouter } from 'next/router'
import s from './InfoPage.module.scss'
import { ArrowBack, Button, Typography } from '@ictroot/ui-kit'

type Props = {
  title: string
  children: React.ReactNode
  backButtonText?: string
}

export const InfoPage = ({ title, children, backButtonText = 'Back' }: Props) => {
  /* const router = useRouter()
  const handleBack = () => {
    router.back()
  } */

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <Button variant="text" onClick={() => {}} className={s.link}>
          <ArrowBack />
          <Typography variant={'regular_14'}>{backButtonText}</Typography>
        </Button>

        <div className={s.content}>
          <Typography variant="h1" asChild>
            <h2>{title}</h2>
          </Typography>
          {children}
        </div>
      </div>
    </div>
  )
}
