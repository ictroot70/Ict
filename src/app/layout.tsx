import StoreProvider from '@/app/providers/StoreProvider'
import { ToastWrapper } from '@/app/providers/ToastWrapper'
import { RootLayoutClient } from '@/app/RootLayoutClient'
import { AppHeader } from '@/widgets/Header'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import './globals.css'
import 'react-toastify/ReactToastify.css'

export const metadata: Metadata = {
  title: 'Ictroot — Modern Social Platform',
  description:
    'A fully functional social web application built with React, Next.js, and Redux Toolkit.',
  keywords: [
    'Ictroot',
    'social platform',
    'photo gallery',
    'React',
    'Next.js',
    'Redux Toolkit',
    'Zod',
    'React Hook Form',
    'RTK Query',
    'TypeScript',
    'Framer Motion',
    'Docker',
    'Jenkins',
    'Storybook',
    'Sass',
    'UI library',
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
    <html lang={'en'}>
      <body className={`${inter.variable}`}>
        <StoreProvider>
          <AppHeader />
          <ToastWrapper>
            <RootLayoutClient>{children}</RootLayoutClient>
          </ToastWrapper>
        </StoreProvider>
      </body>
    </html>
  )
}
