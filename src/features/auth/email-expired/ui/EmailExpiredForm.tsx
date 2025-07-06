'use client'

import Image from 'next/image'
import s from './EmailExpiredForm.module.scss'

import { Button, ModalWithButton, Typography } from '@/shared/ui'

import { ControlledInput } from '@/features/formControls/input/ui'
import picture from '../assets/icons/rafiki.svg'
import { useEmailExpired } from '../hooks/useEmailExpired'

export const EmailExpiredForm = () => {
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
      <ModalWithButton
        title="Email sent"
        message={`We have sent a link to confirm your email to ${currentEmail}`}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
