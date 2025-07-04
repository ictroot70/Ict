'use client'
import '@ictroot/ui-kit/style.css'
import './globals.css'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import StoreProvider from '@/app/StoreProvider'
import { ToastProvider } from '@ictroot/ui-kit'
import {AppHeader} from '@/widgets/Header'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-family',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <StoreProvider>
          <ToastProvider
            position="bottom-right"
            enableProgressBar={true}
            maxToasts={3}
            enableHoverPause
          >
            <AppHeader />
            <main>{children}</main>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
