import type { Metadata } from 'next'

import { ReactNode, Suspense } from 'react'

import { RootLayoutClient } from '@/app/RootLayoutClient'
import { MonitoringBootstrap } from '@/app/providers/MonitoringBootstrap/MonitoringBootstrap'
import StoreProvider from '@/app/providers/StoreProvider'
import { ToastWrapper } from '@/app/providers/ToastWrapper'
import { AuthSessionHintContextValue, AuthSessionHintProvider } from '@/shared/auth'
import { AppHeader } from '@/widgets/Header'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import './globals.css'
import 'react-toastify/ReactToastify.css'

import layoutShellStyles from './RootLayoutClient.module.scss'

const DEFAULT_PAGE_TITLE = 'Ictroot — Modern Social Platform'

export const metadata: Metadata = {
  title: DEFAULT_PAGE_TITLE,
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
    title: DEFAULT_PAGE_TITLE,
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
  display: 'optional',
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

const CRITICAL_BASE_STYLE = `
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  overflow: hidden;
  background: var(--background, var(--color-dark-700, #0d0d0d));
}
header[data-is-authorized] {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 0.75rem 0;
}
main {
  display: block;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  height: 100vh;
  min-height: 0;
  margin: 0;
  padding: 60px 0 0;
}
* {
  box-sizing: border-box;
}
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const cookieStore = await cookies()

  const hasAuthHint = cookieStore.get('auth_session_hint')?.value === '1'
  const authUserIdHintRaw = Number(cookieStore.get('auth_user_id_hint')?.value ?? '')
  const authUserIdHint: number | null =
    Number.isInteger(authUserIdHintRaw) && authUserIdHintRaw > 0 ? authUserIdHintRaw : null

  const initialAuthHint: AuthSessionHintContextValue = {
    hasAuthHint,
    authUserIdHint,
  }
  const messages = await getMessages()

  return (
    <html lang={'en'} suppressHydrationWarning>
      <head>
        <title>{DEFAULT_PAGE_TITLE}</title>
        <style id={'critical-base-style'}>{CRITICAL_BASE_STYLE}</style>
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <Script id={'auth-hint-bootstrap'} strategy={'beforeInteractive'}>
          {AUTH_HINT_BOOTSTRAP_SCRIPT}
        </Script>
        <MonitoringBootstrap />
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <AuthSessionHintProvider value={initialAuthHint}>
              <AppHeader />
              <Suspense fallback={<RootLayoutFallback>{children}</RootLayoutFallback>}>
                <RootLayoutClient>{children}</RootLayoutClient>
              </Suspense>
            </AuthSessionHintProvider>
          </StoreProvider>
        </NextIntlClientProvider>
        <ToastWrapper />
      </body>
    </html>
  )
}
