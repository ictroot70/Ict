import {
  EmailExpiredInputs,
  useBaseEmailResend,
  useResendEmailVerificationMutation,
} from '@/features/auth'
import { ApiErrorResponse } from '@/shared/api'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'

export const useEmailVerificationResend = () => {
  const [resendEmailVerification, { isLoading }] = useResendEmailVerificationMutation()

  const { handleSuccess, handleCloseModalWindow, setError, ...formMethods } = useBaseEmailResend()

  const handleSubmit = formMethods.handleSubmit(async ({ email }: EmailExpiredInputs) => {
    try {
      await resendEmailVerification({
        email,
        baseUrl: window.location.origin + APP_ROUTES.AUTH.REGISTRATION_CONFIRM,
      }).unwrap()
      handleSuccess(email)
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = (error as { data: ApiErrorResponse }).data

        if (apiError.messages) {
          apiError.messages.forEach(err => {
            if (err.field === 'email') {
              setError('email', { type: 'custom', message: err.message })
            }
          })

          return
        }
      }
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
    handleCloseModalWindow,
  }
}
