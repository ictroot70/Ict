'use client'

import { SignInForm } from '@/features/auth'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInFormContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectFrom = searchParams.get('from')

  return <SignInForm router={router} redirectFrom={redirectFrom} />
}
