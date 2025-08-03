import { useEffect, useState } from 'react'

import { useConfirmRegistrationMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { useSearchParams, useRouter } from 'next/navigation'

export function useRegistrationConfirm() {
  const [isValidating, setIsValidating] = useState(true)

  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code')

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
