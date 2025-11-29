'use client'

import { useRouter } from 'next/navigation'
import { SignInForm } from '@/features/auth'

export default function SignInFormContainer() {
  const router = useRouter()

  return <SignInForm router={router} />
}
