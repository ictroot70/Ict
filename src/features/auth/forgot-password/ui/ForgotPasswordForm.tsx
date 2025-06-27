'use client'

import s from './ForgotPasswordForm.module.scss'

import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Card, Recaptcha, Typography } from '@/shared'
import ModalEmailSent from './ModalEmailSent/ModalEmailSent'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { passwordRecovery } from '../api/passwordRecovery'
import { useState } from 'react'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  recaptcha: z.string().min(1, 'Please complete the reCAPTCHA'),
})

type Inputs = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitted, isValid },
  } = useForm<Inputs>({
    defaultValues: { email: '', recaptcha: '' },
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const router = useRouter()

  const onSubmit = async ({ email, recaptcha }: Inputs) => {
    const response = await passwordRecovery({
      email,
      recaptcha,
      baseUrl: window.location.origin,
    })

    if (response.ok) {
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
      reset()
    } else {
      setError('email', { type: 'custom', message: "User with this email doesn't exist" })
    }
  }

  const handleRecaptchaChange = async (token: string = '') => {
    setValue('recaptcha', token, { shouldValidate: true })
  }

  return (
    <>
      <Card className={s.wrapper}>
        <Typography variant={'h1'} className={s.title}>
          Forgot Password
        </Typography>
        <div className={s.wrap}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ControlledInput
              control={control}
              name="email"
              inputType="text"
              label="Email"
              placeholder="Enter your email"
            />

            <Typography variant={'regular_14'} className={s.text}>
              Enter your email address and we will send you further instructions
            </Typography>

            <Button type="submit" fullWidth disabled={!isValid} className={s.button}>
              Send Link
            </Button>

            <Button
              variant={'text'}
              fullWidth
              onClick={() => router.push('/sign-in')}
              className={s.button}
            >
              Back to Sign In
            </Button>

            <Recaptcha
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </form>
        </div>
      </Card>

      <ModalEmailSent
        email={currentEmail}
        isOpen={isOpenModalWindow}
        onClose={() => setIsOpenModalWindow(false)}
      />
    </>
  )
}
