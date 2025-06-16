import { InfoPage, termsOfServiceText } from '@/shared/components/InfoPage'

export default function TermsService() {
  return (
    <InfoPage
      title="Terms of Service"
      content={termsOfServiceText}
      backButtonText="Back to Sign Up"
    />
  )
}
