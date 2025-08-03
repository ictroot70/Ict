'use client'

import { Suspense } from 'react'

import { EmailConfirmed } from '@/features/auth'
import { Loading } from '@/shared/composites'

export default function RegistrationConfirmation() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailConfirmed />
    </Suspense>
  )
}
