'use client'
import Link from 'next/link'
import {
  BellOutline,
  Button,
  Header as HeaderUI,
  RussiaFlag,
  Select,
  Typography,
  UkFlag,
} from '@/shared/ui'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toasr'
import { useLogoutMutation, useMeQuery } from '@/features/auth/api/authApi'

// TODO: This is a temporary header
export default function Header() {
  const [logout] = useLogoutMutation()
  const router = useRouter()
  const { data: user, isLoading, isError, isSuccess } = useMeQuery()
  const isAuthorized = isSuccess && user
  const { showToast } = useToastContext()
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
    }
  }
  return (
    <HeaderUI
      logo={
        <Link href="/">
          <Typography variant="h1" color="primary">
            Logo
          </Typography>
        </Link>
      }
    >
      {/* TODO: This is a temporary header(these buttons should be removed in the future)*/}
      <Button as={Link} href="/public-users/profile/2908" variant="secondary">
        My Profile
      </Button>
      <Button as={Link} href="/public-users/profile/2908/edit" variant="secondary">
        Edit Profile
      </Button>
      <Button variant="primary" onClick={handleLogout}>
        Logout
      </Button>
      {/*End of temporary header*/}
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
            <Button as={Link} href="/auth/login" variant={'text'}>
              Log in
            </Button>
            <Button as={Link} href="/auth/registration">
              Sing up
            </Button>
          </div>
        )}
      </div>
    </HeaderUI>
  )
}
