'use client'

import { SignInForm } from '@/features/auth'
import { useRouter } from 'next/navigation'

export default function SignInFormContainer() {
  const router = useRouter()

  return <SignInForm router={router} />
}
