'use client'

import type { SendMessagePayload } from '@/entities/messenger'

import { createContext, useContext, type ReactNode } from 'react'

export interface MessengerRealtimeContextValue {
  isConnected: boolean
  sendMessage: (payload: SendMessagePayload) => boolean
}

export const MessengerRealtimeContext = createContext<MessengerRealtimeContextValue | null>(null)

const unavailableRealtime: MessengerRealtimeContextValue = {
  isConnected: false,
  sendMessage: () => false,
}

export function MessengerRealtimeFallbackProvider({ children }: { children: ReactNode }) {
  return (
    <MessengerRealtimeContext.Provider value={unavailableRealtime}>
      {children}
    </MessengerRealtimeContext.Provider>
  )
}

export function useMessengerRealtimeConnection() {
  const context = useContext(MessengerRealtimeContext)

  if (!context) {
    throw new Error('useMessengerRealtimeConnection must be used within MessengerRealtimeBridge')
  }

  return context
}
