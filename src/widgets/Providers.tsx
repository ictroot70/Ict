'use client'

import { ToastProvider } from '@ictroot/ui-kit'
import { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider position="bottom-right" enableProgressBar={true} maxToasts={3} enableHoverPause>
      {children}
    </ToastProvider>
  )
}
