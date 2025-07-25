import { Button, Header, Typography } from '@/shared/ui'

import Link from 'next/link'
import { useMeQuery } from '@/features/auth/api/authApi'
import { useState } from 'react'
import { APP_ROUTES } from '@/shared/constant/app-routes'

import styles from './AppHeader.module.scss'
import { LogoutModal } from '@/widgets/Header/components/LogoutModal'
import { useLogoutHandler } from '@/widgets/Header/hooks/useLogoutHandler'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton/NotificationButton'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect/LanguageSelect'
import { AuthButtons } from '@/widgets/Header/components/AuthButtons/AuthButtons'
import { Header_v2 } from '@/shared/ui/Header_v2/Header_v2'

export const AppHeader = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { data: user, isLoading, isSuccess } = useMeQuery()
  const isAuthorized = isSuccess && user

  const { handleLogout, handleCancelLogout } = useLogoutHandler(() => setShowLogoutModal(false))

  return (
    <Header_v2
      className={styles.header}
      logo={
        <Link href={APP_ROUTES.ROOT}>
          <Typography variant={'h1'}>ICTRoot</Typography>
        </Link>
      }
      // height={'60px'}
    >
      {/* TODO: This is a temporary header(these buttons should be removed in the future)*/}
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
        <NotificationButton />
        <LanguageSelect />
        {!isLoading && !isAuthorized && <AuthButtons />}
      </div>
    </Header_v2>
  )
}
