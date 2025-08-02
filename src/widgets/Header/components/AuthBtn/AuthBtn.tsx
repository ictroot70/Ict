import { APP_ROUTES } from '@/shared/constant'
import { Button } from '@/shared/ui'
import Link from 'next/link'

import styles from './AuthBtn.module.scss'

export const AuthBtn = () => (
  <div className={styles.authButtons}>
    {/* Todo: later need ad asChild*/}
    <Button variant={'text'}>
      <Link href={APP_ROUTES.AUTH.LOGIN}>Log in</Link>
    </Button>
    {/*Todo: later need ad asChild*/}
    <Button>
      <Link href={APP_ROUTES.AUTH.REGISTRATION}>Sign up</Link>
    </Button>
  </div>
)
