'use client'

import { Suspense } from 'react'

import { EmailExpiredForm } from '@/features/auth/email-expired/ui/EmailExpiredForm'
import { Loading } from '@/shared/composites'

export default function EmailExpired() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailExpiredForm />
    </Suspense>
  )
}
