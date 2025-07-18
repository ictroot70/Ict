import { Button } from '@/shared/ui'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import styles from '../../AppHeader.module.scss'

export const AuthButtons = () => (
  <div className={styles.authButtons}>
    <Button as={Link} href={APP_ROUTES.AUTH.LOGIN} variant={'text'}>
      Log in
    </Button>
    <Button as={Link} href={APP_ROUTES.AUTH.REGISTRATION}>
      Sign up
    </Button>
  </div>
)
