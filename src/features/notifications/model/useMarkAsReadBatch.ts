'use client'
import { useCallback, useEffect, useRef } from 'react'

const DEBOUNCE_MS = 2000

export interface UseMarkAsReadBatchOptions {
  isOpen: boolean
  onFlush: (ids: number[]) => Promise<void>
}

export interface UseMarkAsReadBatchResult {
  addSeenId: (id: number) => void
  flushNow: () => void
}
export function useMarkAsReadBatch({
  isOpen,
  onFlush,
}: UseMarkAsReadBatchOptions): UseMarkAsReadBatchResult {
  const seenIdsRef = useRef<Set<number>>(new Set())
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onFlushRef = useRef(onFlush)
  const isOpenRef = useRef(isOpen)

  useEffect(() => {
    onFlushRef.current = onFlush
  })

  useEffect(() => {
    isOpenRef.current = isOpen
  })

  const cancelDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const flush = useCallback(async () => {
    cancelDebounce()

    const ids = Array.from(seenIdsRef.current)

    if (ids.length === 0) {
      return
    }

    seenIdsRef.current = new Set()

    try {
      await onFlushRef.current(ids)
    } catch {
      for (const id of ids) {
        seenIdsRef.current.add(id)
      }
    }
  }, [cancelDebounce])

  useEffect(() => {
    if (!isOpen) {
      void flush()
    }
  }, [isOpen, flush])

  const addSeenId = useCallback(
    (id: number) => {
      seenIdsRef.current.add(id)

      if (!isOpenRef.current) {
        return
      }

      cancelDebounce()
      debounceTimerRef.current = setTimeout(() => {
        void flush()
      }, DEBOUNCE_MS)
    },
    [cancelDebounce, flush]
  )

  useEffect(() => {
    return () => {
      cancelDebounce()
    }
  }, [cancelDebounce])

  return { addSeenId, flushNow: flush }
}
