'use client'
import { useState } from 'react'

import { useMeQuery } from '@/features/auth'
import { Alert, Button, Header_v2, Typography } from '@/shared/ui'
import Link from 'next/link'

import styles from './AppHeader.module.scss'

import { AuthBtn, LanguageSelect, LogoutModal, NotificationButton } from './components'
import { useHomeLink, useLogoutHandler } from './hooks'

export const AppHeader = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: user, isLoading, isSuccess, isError } = useMeQuery()
  const isAuthorized = isSuccess && Boolean(user)

  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))
  const homeLink = useHomeLink()

  const confirmLogout = () =>
    handleCancelLogout(
      <Alert typographyVariant={'regular_16'} type={'warning'} message={'Logout canceled'} />
    )

  if (isError) {
    console.log('Failed to fetch user', isError)
    // return null
  }

  return (
    // TODO: This is a temporary header(these buttons should be removed in the future)
    <Header_v2
      isAuthorized={isAuthorized}
      className={styles.header}
      logo={
        <Link href={homeLink}>
          <Typography variant={'h1'}>ICTRoot</Typography>
        </Link>
      }
    >
      {!isLoading && isAuthorized && (
        <Button variant={'primary'} onClick={() => setShowLogoutModal(true)}>
          Logout
        </Button>
      )}
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={confirmLogout}
        userEmail={user?.email}
      />
      <div className={styles.headerControls}>
        {!isLoading && isAuthorized && <NotificationButton />}

        <LanguageSelect />
        {!isLoading && !isAuthorized && <AuthBtn />}
      </div>
    </Header_v2>
  )
}
