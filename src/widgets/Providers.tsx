'use client'

import { ReactNode } from 'react'

import { ToastProvider } from '@ictroot/ui-kit'

export function ClientToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider position={'bottom-right'} enableProgressBar maxToasts={3} enableHoverPause>
      {children}
    </ToastProvider>
  )
}
