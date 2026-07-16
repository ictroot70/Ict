'use client'

import { useEffect } from 'react'

import { initMonitoringClient } from '@/shared/lib/monitoring/sentryTransport'

export function MonitoringBootstrap() {
  useEffect(() => {
    initMonitoringClient()
  }, [])

  return null
}
