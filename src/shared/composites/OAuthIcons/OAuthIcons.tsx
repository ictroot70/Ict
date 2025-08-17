'use client'

import { GitHub, Google } from '@/shared/ui'

import styles from './OAuthIcons.module.scss'

import { GOOGLE_URL } from './constants'

type OAuthIconsProps = {
  onSignInGoogle?: () => void
  onSignInGithub?: () => void
}

// const Google = dynamic(() => import('@/shared/ui').then(m => m.Google), { ssr: false })
// const GitHub = dynamic(() => import('@/shared/ui').then(m => m.GitHub), { ssr: false })

const handleGoogleAuth = () => {
  window.location.assign(GOOGLE_URL)
}

export const OAuthIcons = ({}: OAuthIconsProps) => (
  <div className={styles.oauthProviders}>
    <button onClick={handleGoogleAuth} type={'button'}>
      <Google size={36} />
    </button>

    <a href={'https://inctagram.work/api/v1/auth/github/login'}>
      <GitHub size={36} />
    </a>
  </div>
)
