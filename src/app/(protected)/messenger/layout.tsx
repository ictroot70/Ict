'use client'

import React from 'react'

import { MessengerShell } from '@/widgets/messenger/ui/MessengerShell'

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
  return <MessengerShell>{children}</MessengerShell>
}
