import type { Metadata } from 'next'

import { ReactNode, Suspense } from 'react'

import { RootLayoutClient } from '@/app/RootLayoutClient'
import StoreProvider from '@/app/providers/StoreProvider'
import { ToastWrapper } from '@/app/providers/ToastWrapper'
import { AuthSessionHintProvider } from '@/shared/auth'
import { AppHeader } from '@/widgets/Header'
import { Inter } from 'next/font/google'
import Script from 'next/script'

import './globals.css'
import 'react-toastify/ReactToastify.css'

import layoutShellStyles from './RootLayoutClient.module.scss'

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

const AUTH_HINT_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const key = 'auth_session_hint'
    const expectedValue = '1'
    const hasCookieHint = document.cookie
      .split('; ')
      .some(cookie => cookie.startsWith(key + '=') && cookie.slice(key.length + 1) === expectedValue)
    let hasLocalStorageHint = false

    try {
      hasLocalStorageHint = window.localStorage.getItem(key) === expectedValue
    } catch {}

    if (hasCookieHint || hasLocalStorageHint) {
      document.documentElement.setAttribute('data-auth-hint', expectedValue)

      return
    }

    document.documentElement.removeAttribute('data-auth-hint')
  } catch {}
})()
`

function RootLayoutFallback({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className={layoutShellStyles.wrapper}>
        <div
          className={`${layoutShellStyles.content} ${layoutShellStyles['content--withoutSidebar']}`}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <Script id={'auth-hint-bootstrap'} strategy={'beforeInteractive'}>
          {AUTH_HINT_BOOTSTRAP_SCRIPT}
        </Script>
        <StoreProvider>
          <AuthSessionHintProvider>
            <AppHeader />
            <Suspense fallback={<RootLayoutFallback>{children}</RootLayoutFallback>}>
              <RootLayoutClient>{children}</RootLayoutClient>
            </Suspense>
          </AuthSessionHintProvider>
        </StoreProvider>
        <ToastWrapper />
      </body>
    </html>
  )
}
