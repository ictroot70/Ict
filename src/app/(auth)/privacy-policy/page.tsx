import { InfoPage, privacyPolicyText } from '@/shared/components/InfoPage'

export default function PrivacyPolicy() {
  return (
    <InfoPage title="Privacy Policy" content={privacyPolicyText} backButtonText="Back to Sign Up" />
  )
}
