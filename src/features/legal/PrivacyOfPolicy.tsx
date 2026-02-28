'use client'

import { InfoPage } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { useSearchParams } from 'next/navigation'

import { PrivacyPolicyContent } from './components'

export const PrivacyOfPolicy = () => {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const profileId = searchParams.get('id')

  const getBackLink = (source: string | null) => {
    switch (source) {
      case 'edit-profile':
        if (profileId) {
          const id = parseInt(profileId, 10)

          return APP_ROUTES.PROFILE.EDIT(id)
        }

        return APP_ROUTES.ROOT
      case 'signup':
        return APP_ROUTES.AUTH.REGISTRATION
      default:
        return APP_ROUTES.AUTH.REGISTRATION
    }
  }

  const getBackText = (source: string | null) => {
    switch (source) {
      case 'edit-profile':
        return 'Back to Edit Profile'
      case 'signup':
        return 'Back to Sign Up'
      default:
        return 'Back'
    }
  }

  return (
    <InfoPage title={'Privacy Policy'} backButtonText={getBackText(from)} link={getBackLink(from)}>
      <PrivacyPolicyContent />
    </InfoPage>
  )
}
