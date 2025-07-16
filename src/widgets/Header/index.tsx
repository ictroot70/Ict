import { BellOutline, Button, Header, RussiaFlag, Select, Typography, UkFlag } from '@/shared/ui'

import Link from 'next/link'
import { useLogoutMutation, useMeQuery } from '@/features/auth/api/authApi'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toaster'
import { useState } from 'react'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { LogoutModal } from '@/widgets/Header/LogoutModal'

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
        type: 'success',
        title: 'Success',
        message: 'You have been logged out successfully',
        duration: 5000,
      })
      router.replace(APP_ROUTES.AUTH.LOGIN)
    } catch (e) {
      console.error('Logout failed', e)
      showToast({
        type: 'error',
        title: 'Error',
        message: e || 'Something went wrong',
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

      <LogoutModal
        open={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleLogout}
        userEmail={user?.email || ''}
      />
      {/*<Modal*/}
      {/*  open={showLogoutModal}*/}
      {/*  onClose={() => setShowLogoutModal(false)}*/}
      {/*  modalTitle="Confirm Logout"*/}
      {/*  width="400px"*/}
      {/*  height="auto"*/}
      {/*>*/}
      {/*  <div style={{ padding: '20px', textAlign: 'center' }}>*/}
      {/*    <Typography variant="regular_16" style={{ marginBottom: '20px' }}>*/}
      {/*      Are you really want to log out of your account <strong>{user?.email}</strong> ?*/}
      {/*    </Typography>*/}
      {/*    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>*/}
      {/*      <Button variant="secondary" onClick={handleCancelLogout}>*/}
      {/*        No*/}
      {/*      </Button>*/}
      {/*      <Button variant="primary" onClick={handleLogout}>*/}
      {/*        Yes*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</Modal>*/}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button title="Notification" type={'button'} onClick={() => alert('notification')}>
          <BellOutline size={24} />
        </button>
        <div style={{ marginInline: '45px 36px', width: '163px' }}>
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
        {!isLoading && !isAuthorized && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <Button as={Link} href={APP_ROUTES.AUTH.LOGIN} variant={'text'}>
              Log in
            </Button>
            <Button as={Link} href={APP_ROUTES.AUTH.REGISTRATION}>
              Sing up
            </Button>
          </div>
        )}
      </div>
    </Header>
  )
}
