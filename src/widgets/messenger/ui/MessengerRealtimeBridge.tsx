'use client'

import { useMemo } from 'react'

import { useMeQuery } from '@/features/auth'
import { usePathname } from 'next/navigation'

import { getMessengerPartnerIdFromPath, useMessengerRealtime } from '../model'

export function MessengerRealtimeBridge() {
  const pathname = usePathname()
  const { data: currentUser } = useMeQuery()
  const activePartnerId = useMemo(() => getMessengerPartnerIdFromPath(pathname), [pathname])

  useMessengerRealtime({
    activePartnerId,
    currentUserId: currentUser?.userId ?? 0,
  })

  return null
}
