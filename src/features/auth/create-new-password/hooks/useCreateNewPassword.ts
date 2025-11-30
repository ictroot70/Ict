'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  CreateNewPasswordInputs,
  newPasswordSchema,
  useCheckRecoveryCodeMutation,
  useNewPasswordMutation,
} from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'

export const useCreateNewPassword = (
  urlCode: string,
  urlEmail: string,
  router: { push: (arg0: string) => void }
) => {
  const [checkRecoveryCode] = useCheckRecoveryCodeMutation()
  const [newPassword] = useNewPasswordMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateNewPasswordInputs>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(newPasswordSchema()),
    mode: 'onBlur',
  })

  const [isValidating, setIsValidating] = useState(true)
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)

  useEffect(() => {
    const validateRecoveryCode = async () => {
      if (!urlCode || !urlEmail) {
        router.push(APP_ROUTES.AUTH.LOGIN)

        return
      }
      try {
        await checkRecoveryCode({ recoveryCode: urlCode }).unwrap()
        localStorage.removeItem('access_token')
        setIsValidating(false)
      } catch {
        router.push(`${APP_ROUTES.AUTH.EMAIL_EXPIRED}?email=${urlEmail}`)
      }
    }

    void validateRecoveryCode()
  }, [urlCode, urlEmail, router, checkRecoveryCode])

  const onSubmit = async ({ password }: CreateNewPasswordInputs) => {
    try {
      await newPassword({ newPassword: password, recoveryCode: urlCode as string }).unwrap()
      setIsOpenModalWindow(true)
      reset()
    } catch {
      showToastAlert({
        message: 'Password change failed. Please try again or request a new reset link.',
        duration: 5000,
        type: 'error',
      })
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    router.push(APP_ROUTES.AUTH.LOGIN)
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isValidating,
    isSubmitting,
    isOpenModalWindow,
    handleCloseModalWindow,
  }
}
