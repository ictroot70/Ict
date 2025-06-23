'use client'

import Image from 'next/image'
import picture from '../assets/icons/bro.svg'
import s from './EmailConfirmed.module.scss'
import { Button, Typography } from '@/shared'
import { useRouter } from 'next/navigation'

export const EmailConfirmed = () => {
  const router = useRouter()

  return (
    <div className={s.wrapper}>
      <Typography variant={'h1'} className={s.title} asChild>
        <h2>Congratulations!</h2>
      </Typography>

      <Typography variant={'regular_16'} className={s.description}>
        Your email has been confirmed
      </Typography>

      <Button variant="primary" onClick={() => router.push('/sign-in')} className={s.button}>
        Sign in
      </Button>

      <Image src={picture} alt="Email confirmed" className={s.image} />
    </div>
  )
}
