import { ReactNode } from 'react'

import { AuthGuard } from '@/shared/guards'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
