'use client'

import { EmailExpiredForm } from '@/features/auth/email-expired/ui/EmailExpiredForm'
import { Loading } from '@/shared/ui'
import { Suspense } from 'react'

export default function EmailExpired() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailExpiredForm />
    </Suspense>
  )
}
