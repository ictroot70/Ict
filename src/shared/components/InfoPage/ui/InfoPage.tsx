'use client'
//import { useRouter } from 'next/router'
//import s from './InfoPage.module.scss'
import { ArrowBack, Button, Typography } from '@ictroot/ui-kit'

type Props = {
  title: string
  content: string
  backButtonText?: string
  backLink?: string
}

export const InfoPage = ({ title, content, backButtonText = 'Back', backLink }: Props) => {
  /* const router = useRouter()
  const handleBack = () => {
    router.back()
  } */

  return (
    <>
      <Button variant="text" onClick={() => {}}>
        <ArrowBack />
        <Typography variant={'regular_14'}>{backButtonText}</Typography>
      </Button>

      <Typography variant="h1" asChild>
        <h2>{title}</h2>
      </Typography>

      <Typography variant="regular_14">{content}</Typography>
    </>
  )
}
