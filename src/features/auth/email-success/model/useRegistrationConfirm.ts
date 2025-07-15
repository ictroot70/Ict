import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConfirmRegistrationMutation } from '@/features/auth/api/authApi'
import { useToastContext } from '@/shared/lib/providers/toaster'
import { ROUTES } from '@/shared/constant/routes'
import { generateLoginConfirmedPath } from '@/shared/constant/route.helpers'

export function useRegistrationConfirm() {
  const params = useSearchParams()
  const code = params?.get('code')
  const router = useRouter()
  const [confirmRegistration, { isLoading, isError }] = useConfirmRegistrationMutation()
  const { showToast } = useToastContext()

  useEffect(() => {
    if (code) {
      confirmRegistration({ confirmationCode: code })
        .unwrap()
        .then(() => {
          showToast({
            type: 'success',
            title: 'Registration confirmed',
            message: 'Your email has been successfully confirmed.',
            duration: 4000,
          })
          router.replace(generateLoginConfirmedPath())
        })
        .catch(() => {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Confirmation link expired or invalid.',
            duration: 4000,
          })
          router.replace(ROUTES.AUTH.EMAIL_EXPIRED)
        })
    }
  }, [code, confirmRegistration, router])

  return {
    isLoading,
    isError,
  }
}
