import { useState } from 'react'

import { Button, LogOut } from '@/shared/ui'

import s from './LogOutButton.module.scss'

import { useLogoutHandler } from '../../model/useLogoutHandler'
import { LogoutModal } from '../LogoutModal'

export const LogOutButton = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handlerOpenModal = () => {
    setShowLogoutModal(true)
  }

  const handlerCloseModal = () => {
    setShowLogoutModal(false)
  }

  const { handleLogout, handleCancelLogout, user } = useLogoutHandler(handlerCloseModal)

  return (
    <>
      <Button
        as={'button'}
        variant={'text'}
        className={s.button}
        onClick={handlerOpenModal}
        aria-label={'Log Out'}
      >
        <LogOut />
        <span>Log Out</span>
      </Button>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={handleCancelLogout}
        userEmail={user?.email}
      />
    </>
  )
}
