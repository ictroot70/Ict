'use client'
import { useLogoutMutation, useMeQuery } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { showToastAlert } from '@/shared/lib'
import { useRouter } from 'next/navigation'

export const useLogoutHandler = (onClose: () => void) => {
  const [logout] = useLogoutMutation()
  const router = useRouter()
  const { data: user } = useMeQuery()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong'

      console.error('Logout failed', message)
      showToastAlert({
        message:
          'Server logout was not confirmed. You have been logged out locally; please sign in again if needed.',
        type: 'warning',
      })
    } finally {
      onClose()
      router.replace(APP_ROUTES.AUTH.LOGIN)
    }
  }

  const handleCancelLogout = () => {
    onClose()
  }

  return { handleLogout, handleCancelLogout, user }
}
