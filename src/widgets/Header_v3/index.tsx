import { Button, Header, Typography } from '@/shared/ui'

import Link from 'next/link'
import { useMeQuery } from '@/features/auth/api/authApi'
import { APP_ROUTES } from '@/shared/constant/app-routes'

import s from './Header_v3.module.scss'
import { NotificationButton } from './components/NotificationButton/NotificationButton'
import { LanguageSelect } from './components/LanguageSelect/LanguageSelect'
import { LogoutModal } from './components/LogoutModal'
import { useState } from 'react'
import { useLogoutHandler } from '../Header/hooks/useLogoutHandler'

export const Header_v3 = () => {
  const { data: user, isLoading, isSuccess } = useMeQuery()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))
  const isAuthorized = isSuccess && user

  return (
    <>
      {!isLoading && (
        <LogoutModal
          open={showLogoutModal}
          onConfirm={handleLogout}
          onClose={handleCancelLogout}
          userEmail={user?.email}
        />
      )}
      <Header className={s.header}>
        <div className={s.container}>
          <Link href={APP_ROUTES.ROOT}>
            <Typography variant={'h1'}>ICTRoot</Typography>
          </Link>
          {!isLoading && (
            <div className={s.headerControls}>
              <NotificationButton />
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
