import { usePasswordRecoveryResendingMutation } from '@/features/auth/api/authApi'
import { useSearchParams } from 'next/navigation'
import { useBaseEmailResend } from './useBaseEmailResend'
import { EmailExpiredInputs } from '../model/schemas/emailExpiredSchema'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export const usePasswordRecoveryResend = () => {
  const params = useSearchParams()
  const urlEmail = params?.get('email') || ''
  const [passwordRecoveryResending, { isLoading }] = usePasswordRecoveryResendingMutation()

  const { handleSuccess, showErrorToast, handleCloseModalWindow, ...formMethods } =
    useBaseEmailResend(urlEmail)

  const handleSubmit = formMethods.handleSubmit(async ({ email }: EmailExpiredInputs) => {
    try {
      await passwordRecoveryResending({
        email,
        baseUrl: window.location.origin + APP_ROUTES.AUTH.NEW_PASSWORD,
      }).unwrap()
      handleSuccess(email)
    } catch {
      showErrorToast()
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
