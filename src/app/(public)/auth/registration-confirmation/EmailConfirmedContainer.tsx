'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailConfirmed } from '@/features/auth'

export default function EmailConfirmedContainer() {
  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code') || ''

  return <EmailConfirmed urlCode={urlCode} router={router} />
}
