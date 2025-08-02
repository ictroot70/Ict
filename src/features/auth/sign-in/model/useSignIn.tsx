'use client'

import { useLazyGetMyProfileQuery } from '@/entities/profile'
import { type LoginFields, signInSchema, useLoginMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export const useSignIn = () => {
  const router = useRouter()
  const [logIn, { isLoading }] = useLoginMutation()
  const [triggerProfile] = useLazyGetMyProfileQuery()

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
      const response = await logIn(data).unwrap()
      const decoded = jwtDecode<{ userId: string }>(response.accessToken)
      const userId = decoded?.userId

      localStorage.setItem('access_token', response.accessToken)

      const profile = await triggerProfile().unwrap()

      if (profile?.firstName) {
        router.replace(APP_ROUTES.PROFILE.MY(userId || ''))
      } else {
        router.replace(APP_ROUTES.PROFILE.EDIT(userId || ''))
      }
    } catch (error: any) {
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
    isLoading,
  }
}
