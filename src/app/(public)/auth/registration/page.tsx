'use client'

import { SignUpForm } from '@/features/auth/sign-up/ui/SignUpForm'
import { GuestGuard } from '@/shared/guards'

export default function SingUp() {
  return (
    <GuestGuard>
      <SignUpForm />
    </GuestGuard>
  )
}
