import { Button, Header, Typography, BellOutline, RussiaFlag, Select, UkFlag } from '@/shared/ui'
import Link from 'next/link'
import { useLogoutMutation, useMeQuery } from '@/features/auth/api/authApi'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toasr'
import { Modal } from '@ictroot/ui-kit'
import { useState } from 'react'

export const AppHeader = () => {
  const [logout] = useLogoutMutation()
  const router = useRouter()
  const { showToast } = useToastContext()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { data: user, isLoading, isError, isSuccess } = useMeQuery()
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
      router.replace('/auth/login')
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

  return (
    <Header
      logo={
        <Link href={'/'}>
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

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        modalTitle="Confirm Logout"
        width="400px"
        height="auto"
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="body1" style={{ marginBottom: '20px' }}>
            Are you sure you want to logout?
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLogout}>
              Yes, Logout
            </Button>
          </div>
        </div>
      </Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type={'button'} onClick={() => alert('notification')}>
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
            onValueChange={() => { }}
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
            <Button as={Link} href="/auth/login" variant={'text'}>
              Log in
            </Button>
            <Button as={Link} href="/auth/registration">
              Sing up
            </Button>
          </div>
        )}
      </div>
    </Header>
  )
}