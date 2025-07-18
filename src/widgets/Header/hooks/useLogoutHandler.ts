import { useLogoutMutation, useMeQuery } from '@/features/auth/api/authApi'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toaster'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export const useLogoutHandler = (onClose: () => void) => {
  const [logout] = useLogoutMutation()
  const router = useRouter()
  const { showToast } = useToastContext()
  const { data: user } = useMeQuery()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      showToast({
        type: 'info',
        title: '',
        message: `You have been logged out`,
        duration: 5000,
      })
      router.replace(APP_ROUTES.AUTH.LOGIN)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong'
      console.error('Logout failed', message)
      showToast({
        type: 'error',
        title: 'Error',
        message,
        duration: 5000,
      })
    } finally {
      onClose()
    }
  }

  const handleCancelLogout = () => {
    onClose()
    showToast({
      type: 'info',
      title: '',
      message: user?.email
        ? `Logout cancelled for user ${user.email}`
        : "User with this email doesn't exist",
      duration: 4000,
    })
  }

  return { handleLogout, handleCancelLogout, user }
}
