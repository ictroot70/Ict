'use client'

import { ToastProvider } from '@ictroot/ui-kit'
import { ReactNode } from 'react'

export function ClientToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider position={'bottom-right'} enableProgressBar maxToasts={3} enableHoverPause>
      {children}
    </ToastProvider>
  )
}
