'use client'

import s from './EmailExpired.module.scss'
import Image from 'next/image'

import { Typography, Button } from '@/shared'
import ModalEmailSent from '@/common/components/ModalEmailSent/ModalEmailSent'

import picture from '../assets/icons/rafiki.svg'
import { ControlledInput } from '@/features/formControls/input/ui'
import { useEmailExpired } from '../lib/hooks/useEmailExpired'

export const EmailExpired = () => {
  const {
    control,
    handleSubmit,
    isOpenModalWindow,
    currentEmail,
    urlEmail,
    handleCloseModalWindow,
  } = useEmailExpired()

  return (
    <>
      <div className={s.wrapper}>
        <div className={s.content}>
          <Typography asChild variant={'h1'} className={s.title}>
            <h2>Email verification link expired</h2>
          </Typography>

          <Typography variant={'regular_16'} className={s.description}>
            Looks like the verification link has expired. Not to worry, we can send the link again
          </Typography>

          <form onSubmit={handleSubmit} className={s.form}>
            {!urlEmail && (
              <ControlledInput
                control={control}
                name="email"
                inputType="text"
                label="Email"
                placeholder="Enter your email"
              />
            )}

            {urlEmail && <input type="hidden" {...control.register('email')} />}

            <Button className={s.button} type="submit" fullWidth>
              {urlEmail ? 'Resend link' : 'Resend verification link'}
            </Button>
          </form>
        </div>
        <Image src={picture} alt="Email verification link expired" className={s.image} />
      </div>
      <ModalEmailSent
        email={currentEmail}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
