'use client'

import { useMemo, type ReactNode } from 'react'

import { useMeQuery } from '@/features/auth'
import { usePathname } from 'next/navigation'

import {
  getMessengerPartnerIdFromPath,
  MessengerRealtimeContext,
  useMessengerRealtime,
} from '../model'

interface MessengerRealtimeBridgeProps {
  children: ReactNode
  enabled: boolean
}

export function MessengerRealtimeBridge({ children, enabled }: MessengerRealtimeBridgeProps) {
  const pathname = usePathname()
  const { data: currentUser } = useMeQuery(undefined, { skip: !enabled })
  const activePartnerId = useMemo(() => getMessengerPartnerIdFromPath(pathname), [pathname])

  const realtime = useMessengerRealtime({
    activePartnerId,
    currentUserId: enabled ? (currentUser?.userId ?? 0) : 0,
  })

  return (
    <MessengerRealtimeContext.Provider value={realtime}>
      {children}
    </MessengerRealtimeContext.Provider>
  )
}
