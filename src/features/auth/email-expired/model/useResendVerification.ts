import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToastContext } from '@/shared/lib/providers/toasr'
import { ROUTES } from '@/shared/constant/routes'
import { REGISTRATION_MESSAGES } from '@/shared/constant/registrationMessages'
import { useResendEmailVerificationMutation } from '@/features/auth/api/authApi'

export function useResendVerification() {
  const [resendEmailVerification, { isLoading }] = useResendEmailVerificationMutation()
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { handleSubmit, control, formState: { errors } } = useForm<{ email: string }>({
    defaultValues: { email: "" }
  });
  const { showToast } = useToastContext();

  const onSubmit = async ({ email }: { email: string }) => {
    setServerError("")
    setSuccessMessage("")
    try {
      await resendEmailVerification({
        email,
        baseUrl: window.location.origin + ROUTES.AUTH.REGISTRATION_CONFIRM,
      }).unwrap()
      setSuccessMessage(REGISTRATION_MESSAGES.SENT_LINK(email))
      showToast({
        type: 'success',
        title: 'Email sent',
        message: REGISTRATION_MESSAGES.SENT_LINK(email),
        duration: 4000,
      })
    } catch (error: any) {
      const msg: string = error?.data?.messages?.[0]?.message || REGISTRATION_MESSAGES.NO_RESEND_LINK
      setServerError(msg)
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
        duration: 4000,
      })
    }
  }

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    errors,
    serverError,
    setServerError,
    successMessage,
    setSuccessMessage,
    isLoading,
  }
}
