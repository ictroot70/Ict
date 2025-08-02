'use client'

import { TermsOfServiceContent } from '@/features/legal/components'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { InfoPage } from '@/shared/ui/InfoPage'

export default function TermsService() {
  return (
    <InfoPage
      title="Terms of Service"
      backButtonText="Back to Sign Up"
      link={APP_ROUTES.AUTH.REGISTRATION}
    >
      <TermsOfServiceContent />
    </InfoPage>
  )
}
