import { BellOutline, Button, Header, RussiaFlag, Select, Typography, UkFlag } from '@/shared/ui'

import Link from 'next/link'
import { useLogoutMutation, useMeQuery } from '@/features/auth/api/authApi'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toaster'
import { useState } from 'react'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { ActionConfirmModal } from '@/shared/ui/Modal/ActionConfirmModal/ActionConfirmModal'

import styles from './AppHeader.module.scss'

export const AppHeader = () => {
  const [logout] = useLogoutMutation()
  const router = useRouter()
  const { showToast } = useToastContext()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { data: user, isLoading, isSuccess } = useMeQuery()
  const isAuthorized = isSuccess && user

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      showToast({
        type: 'info',
        title: '',
        message: `You have been logged out`,
        duration: 5000,
      })
      router.replace(APP_ROUTES.AUTH.LOGIN)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong'

      console.error('Logout failed', message)
      showToast({
        type: 'error',
        title: 'Error',
        message: message,
        duration: 5000,
      })
    } finally {
      setShowLogoutModal(false)
    }
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
    showToast({
      type: 'info',
      title: '',
      message: user?.email
        ? `Logout cancelled for user ${user.email}`
        : "User with this email doesn't exist",
      duration: 4000,
    })
  }

  return (
    <Header
      logo={
        <Link href={APP_ROUTES.ROOT}>
          <Typography variant={'h1'}>ICTRoot</Typography>
        </Link>
      }
      height={'70px'}
    >
      {/* TODO: This is a temporary header(these buttons should be removed in the future)*/}
      <Button as={Link} href="/public-users/profile/2908" variant="secondary">
        My Profile
      </Button>
      <Button as={Link} href="/public-users/profile/2908/edit" variant="secondary">
        Edit Profile
      </Button>
      <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
        Logout
      </Button>
      <ActionConfirmModal
        open={showLogoutModal}
        onClose={handleCancelLogout}
        title={'Log Out'}
        message={'Are you really want to log out of your account'}
        highlightedText={user?.email || ''}
        confirmButton={{
          label: 'Yes',
          onClick: handleLogout,
        }}
        cancelButton={{
          label: 'No',
          onClick: handleCancelLogout,
        }}
      />

      <div className={styles.headerControls}>
        <button title="Notification" type="button" onClick={() => alert('notification')}>
          <BellOutline size={24} />
        </button>

        <LanguageSelect />
        {!isLoading && !isAuthorized && <AuthButtons />}
      </div>
    </Header>
  )
}

const AuthButtons = () => (
  <div className={styles.authButtons}>
    <Button as={Link} href={APP_ROUTES.AUTH.LOGIN} variant={'text'}>
      Log in
    </Button>
    <Button as={Link} href={APP_ROUTES.AUTH.REGISTRATION}>
      Sign up
    </Button>
  </div>
)

const LanguageSelect = () => (
  <div className={styles.languageSelect}>
    <Select
      defaultValue={'en'}
      placeholder={'Select...'}
      items={[
        { value: 'en', label: 'English', icon: <UkFlag /> },
        { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
      ]}
      onValueChange={() => {}}
    />
  </div>
)
