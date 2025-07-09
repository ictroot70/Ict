import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ROUTES } from '@/shared/constant/routes'
import { ForgotPasswordInputs, forgotPasswordSchema } from '../model/schemas/forgotPasswordSchema'
import {
  usePasswordRecoveryMutation,
  usePasswordRecoveryResendingMutation,
} from '@/features/auth/api/authApi'
import { useErrorToast } from '@/shared/lib/hooks'
import { ApiErrorResponse } from '@/shared/api/api.types'

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
    mode: 'onBlur',
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
    const baseUrl = window.location.origin + ROUTES.AUTH.NEW_PASSWORD
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
    setIsEmailSent(true)
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
