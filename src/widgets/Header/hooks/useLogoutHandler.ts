'use client'
import { useLogoutMutation, useMeQuery } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify/unstyled'

import 'react-toastify/ReactToastify.css'

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

  const handleCancelLogout = (alert: React.ReactNode) => {
    onClose()
    toast(alert)
  }

  return { handleLogout, handleCancelLogout, user }
}
