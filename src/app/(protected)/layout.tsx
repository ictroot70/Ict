'use client'

import { ReactNode } from 'react'

import { AuthGuard } from '@/shared/guards'

export default function ProtectedLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <AuthGuard>
      <div>{children}</div>
      {modal}
    </AuthGuard>
  )
}
