'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'

import { useLoginMutation, useMeQuery } from '@/features/auth/api/authApi'
import { useToastContext } from '@/shared/lib/providers/toasr'
import { generatePublicUserProfilePath } from '@/shared/constant/route.helpers'
import { signInSchema, type LoginFields } from '@/features/auth/sign-in/model/validation'

export const useSignIn = () => {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [logIn, { isLoading }] = useLoginMutation()
  const meRes = useMeQuery()

  const form = useForm<LoginFields>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      const response = await logIn(data).unwrap()
      const decoded = jwtDecode<{ userId: string }>(response.accessToken)
      const userId = decoded?.userId || meRes.data?.id

      localStorage.setItem('access_token', response.accessToken)

      showToast({
        type: 'success',
        title: 'Welcome!',
        message: 'You have successfully signed in.',
        duration: 4000,
      })

      router.replace(generatePublicUserProfilePath(userId))
      router.refresh()
    } catch (error: any) {
      const message = error?.data?.messages || 'Something went wrong'
      showToast({
        type: 'error',
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
