'use client'

import { useForm } from 'react-hook-form'

import { useLazyGetMyProfileQuery } from '@/entities/profile'
import { useLoginMutation } from '@/features/auth'
import { type LoginFields, signInSchema } from '@/features/auth/sign-in/model/validation'
import { APP_ROUTES } from '@/shared/constant'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify/unstyled'

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

      toast.success('You have successfully signed in.', { autoClose: 5000 })

      if (profile?.firstName) {
        router.replace(APP_ROUTES.PROFILE.MY(userId || ''))
      } else {
        router.replace(APP_ROUTES.PROFILE.EDIT(userId || ''))
      }

      // router.refresh()
    } catch (error: any) {
      const message =
        error?.data?.messages || 'The email or password are incorrect. Try again please'

      toast.error(message, { autoClose: 5000 })
    }

    form.reset()
  })

  return {
    form,
    onSubmit,
    isLoading,
  }
}
