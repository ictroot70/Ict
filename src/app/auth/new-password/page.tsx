'use client'

import { CreateNewPasswordForm } from '@/features/auth/create-new-password/ui/CreateNewPasswordForm'
import { Loading } from '@/shared/ui'
import { Suspense } from 'react'

export default function NewPassword() {
  return (
    <Suspense fallback={<Loading />}>
      <CreateNewPasswordForm />
    </Suspense>
  )
}
