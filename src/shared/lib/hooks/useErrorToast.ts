import { useToastContext } from '@/shared/lib/providers/toaster'

export function useErrorToast() {
  const { showToast } = useToastContext()

  const showErrorToast = ({
    message = 'An unexpected error occurred. Please try again later',
    duration = 5000,
  } = {}) => {
    showToast({
      type: 'error',
      message,
      duration,
    })
  }

  return { showErrorToast }
}
