import { AuthGuard } from '@/shared/guards'
import { ReactNode } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
