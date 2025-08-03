'use client'

import { InfoPage } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'

import { PrivacyPolicyContent } from './components'

export const PrivacyOfPolicy = () => {
  return (
    <InfoPage
      title={'Privacy Policy'}
      backButtonText={'Back to Sign Up'}
      link={APP_ROUTES.AUTH.REGISTRATION}
    >
      <PrivacyPolicyContent />
    </InfoPage>
  )
}
