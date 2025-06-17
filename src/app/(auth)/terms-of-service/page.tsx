'use client'

import { InfoPage, TermsOfServiceContent } from '@/shared/components/InfoPage'

export default function TermsService() {
  return (
    <InfoPage title="Terms of Service" backButtonText="Back to Sign Up">
      <TermsOfServiceContent />
    </InfoPage>
  )
}
