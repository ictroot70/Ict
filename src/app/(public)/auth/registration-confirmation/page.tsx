'use client'

import { Suspense } from 'react'

import { Loading } from '@/shared/composites'

import EmailConfirmedContainer from './EmailConfirmedContainer'

export default function RegistrationConfirmation() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailConfirmedContainer />
    </Suspense>
  )
}
