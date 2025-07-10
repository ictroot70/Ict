'use client'
import { Button, Card, Typography } from '@ictroot/ui-kit'
import Image from 'next/image'
import s from './EmailConfirmed.module.scss'
import { useRegistrationConfirm } from '@/features/auth/email-success/model/useRegistrationConfirm'

export default function EmailConfirmedPage() {

  useRegistrationConfirm();


  return (
    <div className={s.wrapper}>
      <Card className={s.card}>
        <Typography variant="h1" className={s.congrats}>
          Congratulations!
        </Typography>
        <Typography variant="regular_16" className={s.text}>
          Your email has been confirmed
        </Typography>
        <Button
          as="a"
          href="/auth/login"
          variant="primary"
          className={s.button}
        >
          Sign In
        </Button>
        <div className={s.illustration}>
          <Image
            src="/bro.png"
            width={432}
            height={300}
            alt="Email confirmed"
          />
        </div>
      </Card>
    </div>
  )
}
