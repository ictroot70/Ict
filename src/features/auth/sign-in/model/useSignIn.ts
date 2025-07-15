'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'

import { useLoginMutation } from '@/features/auth/api/authApi'
import { useToastContext } from '@/shared/lib/providers/toaster'
import { type LoginFields, signInSchema } from '@/features/auth/sign-in/model/validation'
import { useLazyGetMyProfileQuery } from '@/entities/profile/api/profile.api'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export const useSignIn = () => {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [logIn, { isLoading }] = useLoginMutation()
  const [triggerProfile] = useLazyGetMyProfileQuery()

  const form = useForm<LoginFields>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await logIn(data).unwrap()
      const decoded = jwtDecode<{ userId: string }>(response.accessToken)
      const userId = decoded?.userId

      localStorage.setItem('access_token', response.accessToken)

      const profile = await triggerProfile().unwrap()

      console.log('profile', profile)

      showToast({
        type: 'success',
        title: 'Welcome!',
        message: 'You have successfully signed in.',
        duration: 4000,
      })

      if (profile?.firstName) {
        router.replace(APP_ROUTES.PROFILE.MY(userId || ''))
      } else {
        router.replace(APP_ROUTES.PROFILE.EDIT(userId || ''))
      }

      router.refresh()
    } catch (error: any) {
      const message =
        error?.data?.messages || 'The email or password are incorrect. Try again please'

      showToast({
        type: 'error',
        title: 'Login Failed',
        message,
        duration: 5000,
      })
    }

    form.reset()
  })

  return {
    form,
    onSubmit,
    isLoading,
  }
}
