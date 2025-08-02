'use client'

import { EmailConfirmed } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { Suspense } from 'react'

export default function RegistrationConfirmation() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailConfirmed />
    </Suspense>
  )
}
