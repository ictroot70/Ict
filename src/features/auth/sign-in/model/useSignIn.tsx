import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLazyGetMyProfileQuery } from '@/entities/profile/api'
import { type LoginFields, signInSchema, useLoginMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'

import { resolvePostLoginRedirectPath } from './resolvePostLoginRedirect'

export const useSignIn = (
  router: { replace: (arg0: string) => void },
  redirectFrom?: null | string
) => {
  const [logIn, { isLoading }] = useLoginMutation()
  const [triggerProfile] = useLazyGetMyProfileQuery()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const form = useForm<LoginFields>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = form.handleSubmit(async data => {
    try {
      setIsRedirecting(true)
      const response = await logIn(data).unwrap()
      const safeRedirect = resolvePostLoginRedirectPath(
        redirectFrom,
        typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      )

      if (safeRedirect) {
        router.replace(safeRedirect)

        return
      }

      let userId: number | null = null

      try {
        const decoded = jwtDecode<{ userId?: number }>(response.accessToken)

        if (typeof decoded.userId === 'number' && Number.isInteger(decoded.userId)) {
          userId = decoded.userId
        }
      } catch {
        userId = null
      }

      try {
        const profile = await triggerProfile().unwrap()
        const resolvedProfileId = profile?.id ?? userId

        if (typeof resolvedProfileId === 'number') {
          router.replace(APP_ROUTES.PROFILE.ID(resolvedProfileId))

          return
        }
      } catch {
        if (typeof userId === 'number') {
          router.replace(APP_ROUTES.PROFILE.EDIT(userId))

          return
        }
      }

      router.replace(APP_ROUTES.ROOT)
    } catch (error: any) {
      setIsRedirecting(false)
      const firstMessageFromArray =
        Array.isArray(error?.data?.messages) && typeof error.data.messages[0]?.message === 'string'
          ? error.data.messages[0].message
          : null
      const messageFromString =
        typeof error?.data?.messages === 'string' ? error.data.messages : null
      const message =
        firstMessageFromArray ||
        messageFromString ||
        'The email or password are incorrect. Try again please'

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
