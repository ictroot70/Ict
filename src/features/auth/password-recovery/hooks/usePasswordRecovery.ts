'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  usePasswordRecoveryMutation,
  usePasswordRecoveryResendingMutation,
  ForgotPasswordInputs,
  forgotPasswordSchema,
  normalizeRecaptchaToken,
} from '@/features/auth'
import { ApiErrorResponse } from '@/shared/api'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'

export const usePasswordRecovery = () => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [passwordRecoveryResending] = usePasswordRecoveryResendingMutation()
  const [passwordRecovery] = usePasswordRecoveryMutation()

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

  const handlePasswordRecovery = async ({
    email,
    baseUrl,
    isResending,
    recaptchaToken,
  }: {
    email: string
    baseUrl: string
    isResending: boolean
    recaptchaToken?: string
  }) => {
    try {
      if (isResending) {
        await passwordRecoveryResending({ email, baseUrl }).unwrap()
      } else if (recaptchaToken) {
        await passwordRecovery({ email, recaptcha: recaptchaToken, baseUrl }).unwrap()
        reset()
      } else {
        throw new Error('Missing recaptcha token for password recovery request')
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
      showToastAlert({
        message: 'An unexpected error occurred. Please try again later',
        duration: 5000,
        type: 'error',
      })
    }
  }

  const handleFormSubmit = async ({ email, recaptcha }: ForgotPasswordInputs) => {
    const baseUrl = window.location.origin + APP_ROUTES.AUTH.NEW_PASSWORD

    try {
      if (isEmailSent) {
        await handlePasswordRecovery({
          email,
          baseUrl,
          isResending: true,
        })
      } else {
        const recaptchaToken = normalizeRecaptchaToken(recaptcha)

        if (!recaptchaToken) {
          setError('recaptcha', { type: 'custom', message: 'Please complete the reCAPTCHA' })

          return
        }
        await handlePasswordRecovery({
          email,
          baseUrl,
          isResending: false,
          recaptchaToken,
        })
      }
    } catch {
      showToastAlert({
        message: 'An unexpected error occurred. Please try again later',
        duration: 5000,
        type: 'error',
      })
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      setValue('recaptcha', token, { shouldValidate: true })
    } else {
      setValue('recaptcha', '', { shouldValidate: true })
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
