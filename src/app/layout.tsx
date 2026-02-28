import type { Metadata } from 'next'

import { ReactNode } from 'react'

import { RootLayoutClient } from '@/app/RootLayoutClient'
import StoreProvider from '@/app/providers/StoreProvider'
import { ToastWrapper } from '@/app/providers/ToastWrapper'
import { AuthRestoreProvider } from '@/features/auth/providers'
import { AppHeader } from '@/widgets/Header'
import { Inter } from 'next/font/google'

import './globals.css'
import 'react-toastify/ReactToastify.css'

export const metadata: Metadata = {
  title: 'Ictroot — Modern Social Platform',
  description:
    'A fully functional social web application built with React, Next.js, and Redux Toolkit.',
  keywords: [
    'social network',
    'photo sharing',
    'community platform',
    'online gallery',
    'social media',
  ],
  authors: [{ name: 'Ictroot Team', url: 'https://ictroot.uk' }],
  openGraph: {
    title: 'Ictroot — Modern Social Platform',
    description:
      'A fully functional social web application built with React, Next.js, and Redux Toolkit.',
    url: 'https://ictroot.uk',
    siteName: 'Ictroot',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ictroot Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  metadataBase: new URL('https://ictroot.uk'),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/icon-192x192.png',
      },
      {
        rel: 'icon',
        url: '/icon-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}

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
    <html lang={'en'} suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <StoreProvider>
          <AuthRestoreProvider>
            <AppHeader />
            <RootLayoutClient>{children}</RootLayoutClient>
          </AuthRestoreProvider>
        </StoreProvider>
        <ToastWrapper />
      </body>
    </html>
  )
}
