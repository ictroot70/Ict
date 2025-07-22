import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConfirmRegistrationMutation } from '@/features/auth/api/authApi'
import { APP_ROUTES } from '@/shared/constant/app-routes'

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
  }, [urlCode, router])

  return {
    isValidating,
  }
}
