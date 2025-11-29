'use client'

import { useEffect, useState } from 'react'

import { useConfirmRegistrationMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'

export function useRegistrationConfirm(urlCode: string, router: { push: (arg0: string) => void }) {
  const [isValidating, setIsValidating] = useState(true)

  const [confirmRegistration] = useConfirmRegistrationMutation()

  useEffect(() => {
    const validateConfirmationCode = async () => {
      if (!urlCode) {
        router.push(APP_ROUTES.AUTH.LOGIN)

        return
      }
      try {
        await confirmRegistration({ confirmationCode: urlCode }).unwrap()
        setIsValidating(false)
      } catch {
        router.push(`${APP_ROUTES.AUTH.EMAIL_EXPIRED}`)
      }
    }

    void validateConfirmationCode()
  }, [urlCode, router, confirmRegistration])

  return {
    isValidating,
  }
}
