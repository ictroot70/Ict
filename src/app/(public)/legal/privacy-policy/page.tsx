'use client'

import { PrivacyPolicyContent } from '@/features/legal/components'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { InfoPage } from '@/shared/ui/InfoPage'

export default function PrivacyPolicy() {
  return (
    <InfoPage
      title="Privacy Policy"
      backButtonText="Back to Sign Up"
      link={APP_ROUTES.AUTH.REGISTRATION}
    >
      <PrivacyPolicyContent />
    </InfoPage>
  )
}
