'use client'
import Link from 'next/link'
import { Button } from '@ictroot/ui-kit'
import { useLogoutMutation } from '@/services/ict.api'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/shared/lib/providers/toasr'

export default function Header() {
  const [logout] = useLogoutMutation()
  const router = useRouter()
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
    <header
      className="head"
      style={{
        backgroundColor: 'gray',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '50px',
      }}
    >
      <Link href="/">Home</Link>
      <Button as={Link} href="/auth/login">
        Login
      </Button>
      <Link href="/sign-up">SingUp</Link>
      <Link href="/privacy">Privacy</Link>
      <Button variant="primary" onClick={handleLogout}>
        Logout
      </Button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Button as={Link} href="/public-users/profile/2908" variant="secondary">
          My Profile
        </Button>
        <Button as={Link} href="/public-users/profile/2908/edit" variant="secondary">
          Edit Profile
        </Button>
      </div>
    </header>
  )
}
