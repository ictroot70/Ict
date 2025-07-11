'use client'
import s from './EmailConfirmed.module.scss'
import Image from 'next/image'
import picture from '../assets/icons/bro.svg'

import { ROUTES } from '@/shared/constant/routes'
import { Button, Loading, Typography } from '@/shared/ui'
import Link from 'next/link'

import { useRegistrationConfirm } from '@/features/auth/email-success/model/useRegistrationConfirm'

export default function EmailConfirmed() {
  const { isValidating } = useRegistrationConfirm()

  if (isValidating) {
    return <Loading />
  }

  return (
    <div className={s.wrapper}>
      <div className={s.content}>
        <Typography variant="h1" className={s.title} asChild>
          <h2> Congratulations!</h2>
        </Typography>
        <Typography variant="regular_16" className={s.description}>
          Your email has been confirmed
        </Typography>
        <Button as={Link} href={ROUTES.AUTH.LOGIN} variant="primary" className={s.button}>
          Sign In
        </Button>
      </div>
      <Image src={picture} alt="Email confirmed" className={s.image} />
    </div>
  )
}
