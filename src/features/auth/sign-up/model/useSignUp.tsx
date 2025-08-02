'use client'

import { SignUpFormData, signUpSchema, useSignupMutation } from '@/features/auth'
import { APP_ROUTES, REGISTRATION_MESSAGES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignUp = () => {
  const [signup, { isLoading }] = useSignupMutation()

  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agreement: false,
    },
  })

  const isAgreementChecked = form.watch('agreement')

  const onSubmit = form.handleSubmit(async (data: SignUpFormData) => {
    setServerError('')
    try {
      const result = await signup({
        userName: data.username,
        email: data.email,
        password: data.password,
        baseUrl: window.location.origin + APP_ROUTES.AUTH.REGISTRATION_CONFIRM,
      }).unwrap()

      setIsSuccess(true)

      showToastAlert({
        message: result?.message || `We have sent a link to confirm your email to ${data.email}`,
        duration: 5000,
        type: 'success',
      })

      localStorage.setItem('lastRegistrationEmail', data.email)
    } catch (error: any) {
      const apiError = error as { status: number; data?: any }

      if (apiError && apiError.status === 400 && apiError.data?.messages) {
        apiError.data.messages.forEach((err: any) => {
          if (err.field === 'userName' || err.field === 'username') {
            form.setError('username', {
              type: 'server',
              message: REGISTRATION_MESSAGES.USERNAME_EXISTS,
            })
          } else if (err.field === 'password') {
            form.setError('password', {
              type: 'server',
              message: err.message,
            })
          } else if (err.field === 'email') {
            form.setError('email', {
              type: 'server',
              message: REGISTRATION_MESSAGES.EMAIL_EXISTS,
            })
          }
        })
      } else if (apiError && apiError.status === 429) {
        setServerError('Too many requests. Please wait a moment and try again.')
      } else {
        setServerError(
          `Registration failed. Server returned status: ${apiError?.status || 'unknown'}`
        )
      }
      showToastAlert({
        message: serverError || 'Registration failed',
        duration: 5000,
        type: 'error',
      })
    }
  })

  return {
    form,
    onSubmit,
    isAgreementChecked,
    isLoading,
    serverError,
    isSuccess,
    setIsSuccess,
  }
}
