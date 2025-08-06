'use client'

import { ReactElement } from 'react'

import { InfoPage } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'

import { TermsOfServiceContent } from './components'

export const TermsOfService = (): ReactElement => {
  return (
    <InfoPage
      title={'Terms of Service'}
      backButtonText={'Back to Sign Up'}
      link={APP_ROUTES.AUTH.REGISTRATION}
    >
      <TermsOfServiceContent />
    </InfoPage>
  )
}
