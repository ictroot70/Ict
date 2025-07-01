'use client'

import s from './CreateNewPasswordForm.module.scss'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button, Typography } from '@/shared'
import { ControlledInput } from '@/features/formControls/input/ui'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import ModalPasswordReset from '@/common/components/ModalPasswordReset/ModalPasswordReset'
import FormWrapper from '@/common/components/FormWrapper/FormWrapper'
import { ROUTES } from '@/common/constants/routers'
import { newPasswordSchema } from '../config/schemas'
import { checkRecoveryCode, newPassword } from '../../api'

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
      <FormWrapper title="create new password">
        <form className={s.form} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className={s.inputs}>
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
          </div>

          <Typography variant="regular_14" className={s.description}>
            Your password must be between 6 and 20 characters
          </Typography>

          <Button type="submit" fullWidth={true} className={s.button}>
            Create new password
          </Button>
        </form>
      </FormWrapper>
      <ModalPasswordReset isOpen={isOpenModalWindow} onClose={handleCloseModalWindow} />
    </>
  )
}
