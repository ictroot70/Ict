'use client'

import { ReactNode } from 'react'
import { AuthGuard } from '@/shared/guards'

import s from './ProtectedLayout.module.scss'
import { Sidebar } from '@/widgets/Sidebar'

export default function ProtectedLayout({ children, modal, }: { children: ReactNode, modal: ReactNode }) {
  return (
    <AuthGuard>
      <div className={s.wrapper}>
        <Sidebar />
        <div className={s.content}>{children}</div>
      </div>
      {modal}
    </AuthGuard>
  )
}
