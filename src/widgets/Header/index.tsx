'use client'
import { Button, Header_v2, Typography } from '@/shared/ui'
import Link from 'next/link'
import { useMeQuery } from '@/features/auth/api/authApi'
import { useState } from 'react'
import { LogoutModal } from '@/widgets/Header/components/LogoutModal'
import { useLogoutHandler } from '@/widgets/Header/hooks/useLogoutHandler'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton/NotificationButton'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect/LanguageSelect'
import { AuthButtons } from '@/widgets/Header/components/AuthButtons/AuthButtons'
import { useHomeLink } from '@/widgets/Header/hooks/useHomeLink'
import styles from './AppHeader.module.scss'
export const AppHeader = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: user, isLoading, isSuccess, isError } = useMeQuery()
  const isAuthorized = isSuccess && Boolean(user)

  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))
  const homeLink = useHomeLink()
  if (isError) {
    console.error('User loading error')
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
        <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
          Logout
        </Button>
      )}
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={handleCancelLogout}
        userEmail={user?.email}
      />
      <div className={styles.headerControls}>
        {!isLoading && isAuthorized && <NotificationButton />}

        <LanguageSelect />
        {!isLoading && !isAuthorized && <AuthButtons />}
      </div>
    </Header_v2>
  )
}
