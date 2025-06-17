'use client'

import { InfoPage, PrivacyPolicyContent } from '@/shared/components/InfoPage'

export default function PrivacyPolicy() {
  return (
    <InfoPage title="Privacy Policy" backButtonText="Back to Sign Up">
      <PrivacyPolicyContent />
    </InfoPage>
  )
}
