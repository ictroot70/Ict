'use client'

import s from './CreateNewPasswordForm.module.scss'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'

import { Card, Button, Typography } from '@/shared'
import { ControlledInput } from '@/features/formControls/input/ui'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { newPassword } from '../api/newPassword'
import { PASSWORD_ALLOWED_CHARACTERS, PASSWORD_REGEX, ROUTES } from '../config/constants'
import { checkRecoveryCode } from '../api/checkRecoveryCode'
import ModalPasswordReset from '@/common/components/ModalPasswordReset/ModalPasswordReset'

export const passwordSchema = () => {
  return z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password must be no more than 20 characters' })
    .regex(PASSWORD_REGEX, {
      message: `Password must contain: ${PASSWORD_ALLOWED_CHARACTERS}`,
    })
    .trim()
}

export const newPasswordSchema = () => {
  return z
    .object({
      password: passwordSchema(),
      passwordConfirmation: passwordSchema(),
    })
    .refine(values => values.password === values.passwordConfirmation, {
      message: 'The passwords must match',
      path: ['passwordConfirmation'],
    })
}

type Inputs = z.infer<ReturnType<typeof newPasswordSchema>>

export default function CreateNewPasswordForm() {
  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(newPasswordSchema()),
    mode: 'onBlur',
  })

  const [isValidating, setIsValidating] = useState(true)
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)

  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code')
  const urlEmail = params?.get('email')

  const onSubmit = async ({ password }: Inputs) => {
    const response = await newPassword({ newPassword: password, recoveryCode: urlCode as string })
    if (response.ok) {
      setIsOpenModalWindow(true)
      reset()
    } else {
      /* TODO: Alert с сообщением и(или) router */
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    router.push(ROUTES.signIn)
  }

  useEffect(() => {
    const validateRecoveryCode = async () => {
      try {
        if (!urlCode || !urlEmail) {
          router.push(ROUTES.emailExpired)
          return
        }

        const response = await checkRecoveryCode({ recoveryCode: urlCode })

        if (response.ok) {
          setIsValidating(false)
        } else {
          router.push(`${ROUTES.emailExpired}?email=${urlEmail}`)
        }
      } catch (error) {
        router.push(ROUTES.emailExpired)
      }
    }

    validateRecoveryCode()
  }, [urlCode, urlEmail, router])

  if (isValidating) {
    return null
  }

  return (
    <>
      <Card className={s.wrapper}>
        <Typography variant="h1" className={s.title}>
          Create New Password
        </Typography>
        <form className={s.wrap} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <ControlledInput
            control={control}
            name="password"
            inputType="hide-able"
            label="New password"
            placeholder="Enter your password"
          />
          <ControlledInput
            control={control}
            name="passwordConfirmation"
            inputType="hide-able"
            placeholder="Confirm your password"
            label="Password confirmation"
          />
          <Button type="submit" fullWidth={true} className={s.button}>
            Create new password
          </Button>
        </form>
      </Card>
      <ModalPasswordReset isOpen={isOpenModalWindow} onClose={handleCloseModalWindow} />
    </>
  )
}
