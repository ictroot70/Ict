import {
  EmailExpiredInputs,
  useBaseEmailResend,
  usePasswordRecoveryResendingMutation,
} from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { useSearchParams } from 'next/navigation'

export const usePasswordRecoveryResend = () => {
  const params = useSearchParams()
  const urlEmail = params?.get('email') || ''
  const [passwordRecoveryResending, { isLoading }] = usePasswordRecoveryResendingMutation()

  const { handleSuccess, handleCloseModalWindow, ...formMethods } = useBaseEmailResend(urlEmail)

  const handleSubmit = formMethods.handleSubmit(async ({ email }: EmailExpiredInputs) => {
    try {
      await passwordRecoveryResending({
        email,
        baseUrl: window.location.origin + APP_ROUTES.AUTH.NEW_PASSWORD,
      }).unwrap()
      handleSuccess(email)
    } catch {
      showToastAlert({
        message: 'An unexpected error occurred. Please try again later',
        duration: 5000,
        type: 'error',
      })
    }
  })

  return {
    ...formMethods,
    handleSubmit,
    isSubmitting: isLoading || formMethods.formState.isSubmitting,
    isOpenModalWindow: formMethods.isOpenModalWindow,
    currentEmail: formMethods.currentEmail,
    urlEmail,
    handleCloseModalWindow,
  }
}
