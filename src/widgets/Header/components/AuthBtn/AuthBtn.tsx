import { ReactElement, ReactNode } from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { Button } from '@/shared/ui'
import Link from 'next/link'

import styles from './AuthBtn.module.scss'

type Props = {
  children?: ReactNode
}

export const AuthBtn = ({ children }: Props): ReactElement => {
  if (children) {
    return <div className={styles.authButtons}>{children}</div>
  }

  return (
    <div className={styles.authButtons}>
      {/* Todo: later need ad asChild*/}
      <Button as={Link} href={APP_ROUTES.AUTH.LOGIN} variant={'text'}>
        Log in
      </Button>
      {/* Todo: later need ad asChild*/}
      <Button as={Link} href={APP_ROUTES.AUTH.REGISTRATION}>
        Sign up
      </Button>
    </div>
  )
}
