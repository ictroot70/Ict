import s from './LogOutButton.module.scss'
import { useState } from 'react'
import { Button, LogOut } from '@/shared/ui'
import { LogoutModal } from '../LogoutModal'
import { useLogoutHandler } from '../../model/useLogoutHandler'

export const LogOutButton = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handlerOpenModal = () => {
    setShowLogoutModal(true)
  }

  const handlerCloseModal = () => {
    setShowLogoutModal(false)
  }

  const { handleLogout, handleCancelLogout, user } = useLogoutHandler(handlerCloseModal)

  const confirmLogout = () => handleCancelLogout()

  return (
    <>
      <Button as="button" variant="text" className={s.button} onClick={handlerOpenModal}>
        <LogOut />
        <span>Log Out</span>
      </Button>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={confirmLogout}
        userEmail={user?.email}
      />
    </>
  )
}
