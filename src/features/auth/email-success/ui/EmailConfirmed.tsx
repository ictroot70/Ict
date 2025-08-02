'use client'
import { Bro, useRegistrationConfirm } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Typography } from '@/shared/ui'
import Image from 'next/image'
import Link from 'next/link'

import styles from './EmailConfirmed.module.scss'

export const EmailConfirmed = () => {
  const { isValidating } = useRegistrationConfirm()

  if (isValidating) {
    return <Loading />
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Typography variant={'h1'} className={styles.title} asChild>
          <h2> Congratulations!</h2>
        </Typography>
        <Typography variant={'regular_16'} className={styles.description}>
          Your email has been confirmed
        </Typography>
        {/*Todo: later need add asChild for button*/}
        <Button variant={'primary'} className={styles.button}>
          <Link href={APP_ROUTES.AUTH.LOGIN}>Sign In</Link>
        </Button>
      </div>
      <Image src={Bro} alt={'Email confirmed'} className={styles.image} />
    </div>
  )
}
