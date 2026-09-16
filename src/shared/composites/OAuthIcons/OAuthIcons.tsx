import { Button, GitHub, Google } from '@/shared/ui'

import styles from './OAuthIcons.module.scss'

type Props = {
  onSignInGoogle?: () => void
  onSignInGithub?: () => void
}

export const OAuthIcons = ({ onSignInGoogle, onSignInGithub }: Props) => (
  <div className={styles.oauthProviders}>
    <Button variant={'text'} onClick={onSignInGoogle} type={'button'} className={styles.btn}>
      <Google size={36} />
    </Button>
    <Button variant={'text'} onClick={onSignInGithub} type={'button'} className={styles.btn}>
      <GitHub size={36} />
    </Button>
  </div>
)
