'use client'

import { useForm } from 'react-hook-form'

import { useLazyGetMyProfileQuery } from '@/entities/profile'
import { type LoginFields, signInSchema, useLoginMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const useSignIn = () => {
  const router = useRouter()
  const [logIn, { isLoading }] = useLoginMutation()
  const [triggerProfile] = useLazyGetMyProfileQuery()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const form = useForm<LoginFields>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      setIsRedirecting(true)
      const response = await logIn(data).unwrap()
      const decoded = jwtDecode<{ userId: string }>(response.accessToken)
      const userId = decoded?.userId

      localStorage.setItem('access_token', response.accessToken)

      const profile = await triggerProfile().unwrap()

      if (profile) {
        router.replace(APP_ROUTES.PROFILE.ID(userId))
      } else {
        router.replace(APP_ROUTES.PROFILE.EDIT)
      }
    } catch (error: any) {
      setIsRedirecting(false)
      const message =
        error?.data?.messages || 'The email or password are incorrect. Try again please'

      showToastAlert({
        message,
        type: 'error',
        duration: 4000,
      })
    }
  })

  return {
    form,
    onSubmit,
    isLoading: isLoading || isRedirecting,
  }
}
