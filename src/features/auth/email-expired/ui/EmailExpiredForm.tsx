'use client'

import Image from 'next/image'
import s from './EmailExpiredForm.module.scss'

import { Button, ModalWithButton, Typography } from '@/shared/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import picture from '../assets/icons/rafiki.svg'
import { useSearchParams } from 'next/navigation'
import {
  useEmailVerificationResend,
  usePasswordRecoveryResend,
} from '@/features/auth/email-expired'

export const EmailExpiredForm = () => {
  const params = useSearchParams()
  const urlEmail = params?.get('email')

  const hook = urlEmail ? usePasswordRecoveryResend() : useEmailVerificationResend()

  const {
    control,
    handleSubmit,
    isOpenModalWindow,
    isSubmitting,
    currentEmail,
    handleCloseModalWindow,
  } = hook

  return (
    <>
      <div className={s.wrapper}>
        <div className={s.content}>
          <Typography asChild variant={'h1'} className={s.title}>
            <h2>
              {urlEmail ? 'Password recovery link expired' : 'Email verification link expired'}
            </h2>
          </Typography>

          <Typography variant={'regular_16'} className={s.description}>
            {urlEmail
              ? 'Looks like the password recovery link has expired. We can send a new one'
              : 'Looks like the verification link has expired. Not to worry, we can send the link again'}
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

            <Button className={s.button} type="submit" fullWidth disabled={isSubmitting}>
              {urlEmail ? 'Resend recovery link' : 'Resend verification link'}
            </Button>
          </form>
        </div>
        <Image src={picture} alt="Link expired" className={s.image} />
      </div>
      <ModalWithButton
        title="Email sent"
        message={`We have sent a link to ${urlEmail ? 'recover your password' : 'confirm your email'} to ${currentEmail}`}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
