'use client'

import s from './ForgotPasswordForm.module.scss'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { Button, Recaptcha, Typography } from '@/shared'
import { ControlledInput } from '@/features/formControls/input/ui'
import FormWrapper from '@/common/components/FormWrapper/FormWrapper'
import ModalEmailSent from '@/common/components/ModalEmailSent/ModalEmailSent'

import { ROUTES } from '@/common/constants/routers'

import { passwordRecoveryResending } from '../../email-expired/ui/api/passwordRecoveryResending'
import { passwordRecovery } from '../api/passwordRecovery'
import { forgotPasswordSchema } from '../config/schemas'

type Inputs = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { isValid },
  } = useForm<Inputs>({
    defaultValues: { email: '', recaptcha: '' },
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const router = useRouter()
  const recaptchaValue = watch('recaptcha')

  const onSubmit = async ({ email, recaptcha }: Inputs) => {
    if (isEmailSent) {
      const response = await passwordRecoveryResending({
        email,
        baseUrl: window.location.origin + ROUTES.createNewPassword,
      })
      if (response.ok) {
        setCurrentEmail(email)
        setIsOpenModalWindow(true)
      } else {
        setError('email', { type: 'custom', message: "User with this email doesn't exist" })
      }
    } else {
      if (!recaptcha) {
        setError('recaptcha', { type: 'custom', message: 'Please complete the reCAPTCHA' })
        return
      }

      const response = await passwordRecovery({
        email,
        recaptcha,
        baseUrl: window.location.origin + ROUTES.createNewPassword,
      })

      if (response.ok) {
        setCurrentEmail(email)
        setIsOpenModalWindow(true)
        setIsEmailSent(true)
        reset()
      } else {
        setError('email', { type: 'custom', message: "User with this email doesn't exist" })
      }
    }
  }

  const handleRecaptchaChange = async (token: string = '') => {
    setValue('recaptcha', token, { shouldValidate: true })
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  return (
    <>
      <FormWrapper title="forgot password">
        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
          <ControlledInput
            control={control}
            name="email"
            inputType="text"
            label="Email"
            placeholder="Enter your email"
          />

          <Typography variant={'regular_14'} className={s.description}>
            Enter your email address and we will send you further instructions
          </Typography>

          {isEmailSent && (
            <Typography variant={'regular_14'} className={s.message}>
              The link has been sent by email.
              <br />
              If you don’t receive an email send link again
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={!isValid || (!isEmailSent && !recaptchaValue)}
            className={s.button}
          >
            {isEmailSent ? 'Send Link Again' : 'Send Link'}
          </Button>

          <Button
            variant={'text'}
            fullWidth
            onClick={() => router.push(ROUTES.signIn)}
            className={s.button}
          >
            Back to Sign In
          </Button>
          {!isEmailSent && (
            <Recaptcha
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          )}
        </form>
      </FormWrapper>

      <ModalEmailSent
        email={currentEmail}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
