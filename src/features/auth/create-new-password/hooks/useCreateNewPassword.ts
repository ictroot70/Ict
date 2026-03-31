'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  CreateNewPasswordInputs,
  newPasswordSchema,
  resolveNewPasswordError,
  useCheckRecoveryCodeMutation,
  useNewPasswordMutation,
} from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'

function buildRecoveryExpiredRoute(email: string): string {
  const params = new URLSearchParams({ mode: 'recovery' })
  const normalizedEmail = email.trim()

  if (normalizedEmail) {
    params.set('email', normalizedEmail)
  }

  return `${APP_ROUTES.AUTH.EMAIL_EXPIRED}?${params.toString()}`
}

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
    setError,
    formState: { isSubmitting },
  } = useForm<CreateNewPasswordInputs>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(newPasswordSchema()),
    mode: 'onBlur',
  })

  const [isValidating, setIsValidating] = useState(true)
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [resolvedEmail, setResolvedEmail] = useState(() => urlEmail.trim())

  useEffect(() => {
    const validateRecoveryCode = async () => {
      if (!urlCode) {
        router.push(APP_ROUTES.AUTH.LOGIN)

        return
      }
      try {
        const response = await checkRecoveryCode({ recoveryCode: urlCode }).unwrap()

        if (response.email?.trim()) {
          setResolvedEmail(response.email.trim())
        }
        localStorage.removeItem('access_token')
        setIsValidating(false)
      } catch {
        router.push(buildRecoveryExpiredRoute(urlEmail))
      }
    }

    void validateRecoveryCode()
  }, [urlCode, urlEmail, router, checkRecoveryCode])

  const onSubmit = async ({ password }: CreateNewPasswordInputs) => {
    try {
      await newPassword({ newPassword: password, recoveryCode: urlCode }).unwrap()
      setIsOpenModalWindow(true)
      reset()
    } catch (error: unknown) {
      const { fieldErrors, shouldRedirectToEmailExpired, toastMessage } =
        resolveNewPasswordError(error)

      fieldErrors.forEach(fieldError => {
        setError(fieldError.field, {
          type: 'server',
          message: fieldError.message,
        })
      })

      if (shouldRedirectToEmailExpired) {
        const redirectTo = buildRecoveryExpiredRoute(resolvedEmail || urlEmail)

        showToastAlert({
          message: toastMessage,
          duration: 5000,
          type: 'error',
        })
        router.push(redirectTo)

        return
      }

      showToastAlert({
        message: toastMessage,
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
