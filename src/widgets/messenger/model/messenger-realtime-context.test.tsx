/* @vitest-environment jsdom */

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  MessengerRealtimeFallbackProvider,
  useMessengerRealtimeConnection,
} from './messenger-realtime-context'

describe('MessengerRealtimeFallbackProvider', () => {
  it('provides a disconnected realtime contract during the root Suspense fallback', () => {
    const { result } = renderHook(() => useMessengerRealtimeConnection(), {
      wrapper: MessengerRealtimeFallbackProvider,
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.isRecoveringAuthentication).toBe(false)
    expect(result.current.sendMessage({ message: 'Hello', receiverId: 71 })).toBe(false)
  })

  it('still reports a missing provider outside the root boundaries', () => {
    expect(() => renderHook(() => useMessengerRealtimeConnection())).toThrow(
      'useMessengerRealtimeConnection must be used within MessengerRealtimeBridge'
    )
  })
})
