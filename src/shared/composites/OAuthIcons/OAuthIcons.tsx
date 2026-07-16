import { GitHub, Google } from '@/shared/ui'

import styles from './OAuthIcons.module.scss'

type OAuthIconsProps = {
  disabled?: boolean
  onSignInGoogle?: () => void
  onSignInGithub?: () => void
}

// const Google = dynamic(() => import('@/shared/ui').then(m => m.Google), { ssr: false })
// const GitHub = dynamic(() => import('@/shared/ui').then(m => m.GitHub), { ssr: false })

export const OAuthIcons = ({
  disabled = false,
  onSignInGoogle,
  onSignInGithub,
}: OAuthIconsProps) => (
  <div className={styles.oauthProviders}>
    <button onClick={onSignInGoogle} type={'button'} disabled={disabled}>
      <Google size={36} />
    </button>
    <button onClick={onSignInGithub} type={'button'} disabled={disabled}>
      <GitHub size={36} />
    </button>
  </div>
)
