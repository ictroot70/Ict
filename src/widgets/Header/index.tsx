'use client'
import { Button, Header, Typography } from '@/shared/ui'
import Link from 'next/link'
import { useMeQuery } from '@/features/auth/api/authApi'
import { useState } from 'react'
import { LogoutModal } from '@/widgets/Header/components/LogoutModal'
import { useLogoutHandler } from '@/widgets/Header/hooks/useLogoutHandler'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton/NotificationButton'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect/LanguageSelect'
import { useHomeLink } from '@/widgets/Header/hooks/useHomeLink'
import s from './AppHeader.module.scss'
import { APP_ROUTES } from '@/shared/constant/app-routes'
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
    <>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={handleCancelLogout}
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
