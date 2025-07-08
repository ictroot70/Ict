'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toasr'
import { useSignupMutation } from '@/features/auth/api/authApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { REGISTRATION_MESSAGES } from '@/shared/constant/registrationMessages'
import { SignUpFormData, signUpSchema } from '@/features/auth/sign-up/model/validationSchemas'
import { ROUTES } from '@/shared/constant/routes'

export const useSignUp = () => {
  const [signup, { isLoading }] = useSignupMutation()
  const router = useRouter()
  const { showToast } = useToastContext()
  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
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
        baseUrl: window.location.origin + ROUTES.AUTH.REGISTRATION_CONFIRM,
      }).unwrap()
      setIsSuccess(true);

      showToast({
        type: 'success',
        title: 'Registration successful!',
        message:
          result?.message ||
          `We have sent a link to confirm your email to ${data.email}`,
        duration: 4000,
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
      showToast({
        type: 'error',
        title: 'Registration error',
        message: serverError || 'Registration failed',
        duration: 5000,
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
