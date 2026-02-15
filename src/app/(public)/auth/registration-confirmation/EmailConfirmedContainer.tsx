'use client'

import { EmailConfirmed } from '@/features/auth'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EmailConfirmedContainer() {
  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code') || ''

  return <EmailConfirmed urlCode={urlCode} router={router} />
}
