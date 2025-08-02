'use client'
import { Button, Header, Typography } from '@/shared/ui'
import Link from 'next/link'
import { useState } from 'react'

import s from './AppHeader.module.scss'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { useMeQuery } from '@/features/auth'
import { useHomeLink, useLogoutHandler } from './hooks'
import { LanguageSelect, LogoutModal, NotificationButton } from './components'
export const AppHeader = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: user, isLoading, isSuccess, isError } = useMeQuery()
  const isAuthorized = isSuccess && Boolean(user)

  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))
  const homeLink = useHomeLink()

  const confirmLogout = () => handleCancelLogout()

  if (isError) {
    console.log('Failed to fetch user', isError)
  }

  return (
    // TODO: This is a temporary header(these buttons should be removed in the future)
    <>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={confirmLogout}
        userEmail={user?.email}
      />

      <Header isAuthorized={isAuthorized} className={s.header}>
        <div className={s.container}>
          <Link href={homeLink}>
            <Typography variant={'h1'}>ICTRoot</Typography>
          </Link>
          {!isLoading && (
            <div className={s.headerControls}>
              {isAuthorized && <NotificationButton />}
              <LanguageSelect />
              <div className={s.authButtons}>
                {isAuthorized ? (
                  <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button as={Link} href={APP_ROUTES.AUTH.LOGIN} variant={'text'}>
                      Log in
                    </Button>
                    <Button as={Link} href={APP_ROUTES.AUTH.REGISTRATION}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Header>
    </>
  )
}
