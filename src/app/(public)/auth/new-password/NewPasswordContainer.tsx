'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CreateNewPasswordForm } from '@/features/auth/create-new-password/ui/CreateNewPasswordForm'

export default function NewPasswordContainer() {
  const params = useSearchParams()
  const router = useRouter()
  console.log(typeof router)

  const urlCode = params.get('code') ?? ''
  const urlEmail = params.get('email') ?? ''

  return <CreateNewPasswordForm urlCode={urlCode} urlEmail={urlEmail} router={router} />
}
