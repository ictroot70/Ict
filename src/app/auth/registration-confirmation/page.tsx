'use client'

import EmailConfirmed from '@/features/auth/email-success/ui/EmailConfirmed'
import { Loading } from '@/shared/ui'
import { Suspense } from 'react'

export default function RegistrationConfirmation() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailConfirmed />
    </Suspense>
  )
}
