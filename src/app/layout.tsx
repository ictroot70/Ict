'use client'
import './globals.css'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import StoreProvider from '@/app/providers/StoreProvider'
import { ToastProvider } from '@ictroot/ui-kit'
//import { AppHeader } from '@/widgets/Header'
import { useScrollRestoration } from '@/shared/lib/hooks/useScrollRestoration'
import { Header_v3 } from '@/widgets/Header_v3'

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
  useScrollRestoration()
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
            <Header_v3 />
            <main>{children}</main>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
