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
      router.replace(APP_ROUTES.AUTH.LOGIN)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong'

      console.error('Logout failed', message)
    } finally {
      onClose()
    }
  }

  const handleCancelLogout = () => {
    onClose()
    showToastAlert({
      message: "User with this email doesn't exist",
      type: 'info',
    })
  }

  return { handleLogout, handleCancelLogout, user }
}
