import { useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import { useConfirmRegistrationMutation } from "@/features/auth/api/authApi";
import { useToastContext } from '@/shared/lib/providers/toasr'

export function useRegistrationConfirm() {
  const params = useSearchParams();
  const code = params?.get('code');
  const router = useRouter();
  const [confirmRegistration, { isLoading, isError }] = useConfirmRegistrationMutation();
  const { showToast } = useToastContext();

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
          });
          router.replace('/auth/login?confirmed=1');
        })
        .catch(() => {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Confirmation link expired or invalid.',
            duration: 4000,
          });
          router.replace('/auth/email-expired');
        });
    }
  }, [code, confirmRegistration, router]);


  return {
    isLoading,
    isError,
  }
}
