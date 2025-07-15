'use client'

import dynamic from 'next/dynamic'
import s from './OAuthIcons.module.scss'

type OAuthIconsProps = {
  onSignInGoogle?: () => void
  onSignInGithub?: () => void
}

const Google = dynamic(() => import('@/shared/ui').then(m => m.Google), { ssr: false })
const GitHub = dynamic(() => import('@/shared/ui').then(m => m.GitHub), { ssr: false })

export const OAuthIcons = ({ onSignInGoogle, onSignInGithub }: OAuthIconsProps) => (
  <div className={s.oauthProviders}>
    <button onClick={onSignInGoogle} type="button">
      <Google size={36} />
    </button>
    <button onClick={onSignInGithub} type="button">
      <GitHub size={36} />
    </button>
  </div>
)
