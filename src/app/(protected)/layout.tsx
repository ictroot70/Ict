import { ReactNode } from 'react'

import { AuthRestoreProvider } from '@/features/auth/providers'
import { AuthGuard } from '@/shared/guards'

export default function ProtectedLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <AuthRestoreProvider>
      <AuthGuard>
        <div>{children}</div>
        {modal}
      </AuthGuard>
    </AuthRestoreProvider>
  )
}
