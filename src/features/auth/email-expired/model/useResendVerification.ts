import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToastContext } from '@/shared/lib/providers/toasr'

export function useResendVerification() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { handleSubmit, control, formState: { errors } } = useForm<{ email: string }>({
    defaultValues: { email: "" }
  });
  const { showToast } = useToastContext();

  const onSubmit = async ({ email }: { email: string }) => {
    setServerError("");
    setSuccessMessage("");
    try {
      const response = await fetch("https://inctagram.work/api/v1/auth/registration-email-resending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          baseUrl: window.location.origin + '/auth/registration-confirmation',
        })
      });
      if (response.ok && response.status === 204) {
        setSuccessMessage("We have sent a link to confirm your email to " + email);
        showToast({
          type: 'success',
          title: 'Email sent',
          message: `We have sent a link to confirm your email to ${email}`,
          duration: 4000,
        });
      } else {
        const result = await response.json();
        setServerError(result.messages?.[0]?.message || "Failed to resend verification link.");
        showToast({
          type: 'error',
          title: 'Error',
          message: (result.messages?.[0]?.message || "Failed to resend verification link."),
          duration: 4000,
        });
      }
    } catch (e) {
      setServerError("Network error. Please try again.");
      showToast({
        type: 'error',
        title: 'Error',
        message: "Network error. Please try again.",
        duration: 4000,
      });
    }
  };

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    errors,
    serverError,
    setServerError,
    successMessage,
    setSuccessMessage,
  };
}
