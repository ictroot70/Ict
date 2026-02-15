'use client'

import { CreateNewPasswordForm } from '@/features/auth/create-new-password/ui/CreateNewPasswordForm'
import { useSearchParams, useRouter } from 'next/navigation'

export default function NewPasswordContainer() {
  const params = useSearchParams()
  const router = useRouter()

  const urlCode = params.get('code') ?? ''
  const urlEmail = params.get('email') ?? ''

  return <CreateNewPasswordForm urlCode={urlCode} urlEmail={urlEmail} router={router} />
}
