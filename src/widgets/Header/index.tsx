'use client'
import { ReactElement, useState } from 'react'

import { useMeQuery } from '@/features/auth'
import { Button, Header, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './AppHeader.module.scss'

import { AuthBtn, LanguageSelect, LogoutModal, NotificationButton } from './components'
import { useHomeLink, useLogoutHandler } from './hooks'

export const AppHeader = (): ReactElement => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: user, isLoading, isSuccess, isError } = useMeQuery()
  const isAuthorized = isSuccess && Boolean(user)

  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))
  const homeLink = useHomeLink()

  const confirmLogout = () => handleCancelLogout()

  if (isError) {
    // TODO: Add error handling later if needed
    console.log('Failed to fetch user', isError)
  }

  const handleOpenLogout = () => setShowLogoutModal(true)

  const renderAuthControls = () => {
    if (isLoading) {
      return null
    }

    return (
      <div className={s.headerControls}>
        {isAuthorized && <NotificationButton />}
        <LanguageSelect />
        <AuthBtn>
          {/* TODO: This is a temporary header(Logout button should be removed in the future)*/}
          {isAuthorized && (
            <Button variant={'primary'} onClick={handleOpenLogout}>
              Logout
            </Button>
          )}
        </AuthBtn>
      </div>
    )
  }

  return (
    <>
      {isAuthorized && (
        <LogoutModal
          open={showLogoutModal}
          onConfirm={handleLogout}
          onClose={confirmLogout}
          userEmail={user?.email}
        />
      )}

      <Header isAuthorized={isAuthorized} className={s.header}>
        <div className={s.container}>
          <Link href={homeLink}>
            <Typography variant={'h1'}>ICTRoot</Typography>
          </Link>
          {renderAuthControls()}
        </div>
      </Header>
    </>
  )
}
