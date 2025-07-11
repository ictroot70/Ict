import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConfirmRegistrationMutation } from '@/features/auth/api/authApi'
import { ROUTES } from '@/shared/constant/routes'

export function useRegistrationConfirm() {
  const [isValidating, setIsValidating] = useState(true)

  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code')

  const [confirmRegistration] = useConfirmRegistrationMutation()

  useEffect(() => {
    const validateConfirmationCode = async () => {
      if (!urlCode) {
        router.push(ROUTES.AUTH.LOGIN)
        return
      }
      try {
        await confirmRegistration({ confirmationCode: urlCode }).unwrap()
        setIsValidating(false)
      } catch {
        router.push(`${ROUTES.AUTH.EMAIL_EXPIRED}`)
      }
    }

    validateConfirmationCode()
  }, [urlCode, router])

  return {
    isValidating,
  }
}
