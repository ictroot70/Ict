import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  usePasswordRecoveryMutation,
  usePasswordRecoveryResendingMutation,
  ForgotPasswordInputs,
  forgotPasswordSchema,
} from '@/features/auth'
import { ApiErrorResponse } from '@/shared/api'
import { APP_ROUTES } from '@/shared/constant'
import { useErrorToast } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'

export const usePasswordRecovery = () => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [passwordRecoveryResending] = usePasswordRecoveryResendingMutation()
  const [passwordRecovery] = usePasswordRecoveryMutation()
  const { showErrorToast } = useErrorToast()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { isValid, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    defaultValues: { email: '', recaptcha: '' },
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  })

  const recaptchaValue = watch('recaptcha')

  const handlePasswordRecovery = async (email: string, baseUrl: string, recaptcha?: string) => {
    try {
      if (recaptcha) {
        await passwordRecovery({ email, recaptcha, baseUrl }).unwrap()
        reset()
      } else {
        await passwordRecoveryResending({ email, baseUrl }).unwrap()
      }

      setCurrentEmail(email)
      setIsOpenModalWindow(true)
      setIsEmailSent(true)
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = (error as { data: ApiErrorResponse }).data

        if (apiError.messages) {
          apiError.messages.forEach(err => {
            if (err.field === 'email') {
              setError('email', { type: 'custom', message: err.message })
            }
          })

          return
        }
      }
      showErrorToast()
    }
  }

  const handleFormSubmit = async ({ email, recaptcha }: ForgotPasswordInputs) => {
    const baseUrl = window.location.origin + APP_ROUTES.AUTH.NEW_PASSWORD

    try {
      if (isEmailSent) {
        await handlePasswordRecovery(email, baseUrl)
      } else {
        if (recaptcha === undefined) {
          setError('recaptcha', { type: 'custom', message: 'Please complete the reCAPTCHA' })

          return
        }
        await handlePasswordRecovery(email, baseUrl, recaptcha)
      }
    } catch {
      showErrorToast()
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      setValue('recaptcha', token, { shouldValidate: true })
    } else {
      setError('recaptcha', { type: 'custom', message: 'Verification error' })
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  return {
    control,
    handleSubmit: handleSubmit(handleFormSubmit),
    isValid,
    recaptchaValue,
    isEmailSent,
    isSubmitting,
    isOpenModalWindow,
    currentEmail,
    handleRecaptchaChange,
    handleCloseModalWindow,
  }
}
