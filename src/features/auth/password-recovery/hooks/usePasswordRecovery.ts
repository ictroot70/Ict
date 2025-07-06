import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ROUTES } from '@/shared/constant/routes'
import { ForgotPasswordInputs, forgotPasswordSchema } from '../model/schemas/forgotPasswordSchema'
import {
  usePasswordRecoveryMutation,
  usePasswordRecoveryResendingMutation,
} from '@/features/auth/api/authApi'

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
    formState: { isValid },
  } = useForm<ForgotPasswordInputs>({
    defaultValues: { email: '', recaptcha: '' },
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const recaptchaValue = watch('recaptcha')

  const handleInitialRequest = async (email: string, recaptcha: string, baseUrl: string) => {
    try {
      await passwordRecovery({ email, recaptcha, baseUrl }).unwrap()
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
      reset()
    } catch (error) {
      //TODO: handle error properly
      setError('email', { type: 'custom', message: "User with this email doesn't exist" })
    }
  }

  const handleResendEmail = async (email: string, baseUrl: string) => {
    try {
      await passwordRecoveryResending({ email, baseUrl }).unwrap()
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
    } catch (error) {
      //TODO: handle error properly
      setError('email', { type: 'custom', message: "User with this email doesn't exist" })
    }
  }

  const handleFormSubmit = async ({ email, recaptcha }: ForgotPasswordInputs) => {
    const baseUrl = window.location.origin + ROUTES.AUTH.CREATE_NEW_PASSWORD

    if (isEmailSent) {
      await handleResendEmail(email, baseUrl)
    } else {
      if (recaptcha === undefined) {
        setError('recaptcha', { type: 'custom', message: 'Please complete the reCAPTCHA' })
        return
      }
      await handleInitialRequest(email, recaptcha, baseUrl)
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
    isOpenModalWindow,
    currentEmail,
    handleRecaptchaChange,
    handleCloseModalWindow,
  }
}
