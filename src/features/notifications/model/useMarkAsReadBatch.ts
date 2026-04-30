'use client'
import { useCallback, useEffect, useRef } from 'react'

const DEBOUNCE_MS = 2000

export interface UseMarkAsReadBatchOptions {
  isOpen: boolean
  onFlush: (ids: number[]) => Promise<void>
}

export interface UseMarkAsReadBatchResult {
  addSeenId: (id: number) => void
  /** Явный flush — для fallback (клик по item) */
  flushNow: () => void
}

/**
 * B4: Батч-отправка mark-as-read.
 *
 * Логика:
 *   - Накапливает seenIds: Set<number>
 *   - Debounce 2000ms: при добавлении нового id → PUT через 2s (если dropdown открыт)
 *   - flushOnClose: при isOpen → false → немедленный PUT если seenIds непустой
 *   - Guard: не отправляет PUT если seenIds.size === 0
 *   - После успешного PUT: очищает seenIds
 *
 * B4 req 4.1: НЕ вызывает PUT автоматически при открытии dropdown.
 */
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

    // Guard: не отправляем если пусто (B4 req 4.5)
    if (ids.length === 0) {
      return
    }

    // Очищаем до await — чтобы не отправить повторно при параллельном flush
    seenIdsRef.current = new Set()

    try {
      await onFlushRef.current(ids)
    } catch {
      // При ошибке возвращаем ids обратно для следующей попытки
      for (const id of ids) {
        seenIdsRef.current.add(id)
      }
    }
  }, [cancelDebounce])

  // flushOnClose: при isOpen → false немедленно отправляем (B4 req 4.3)
  useEffect(() => {
    if (!isOpen) {
      void flush()
    }
  }, [isOpen, flush])

  const addSeenId = useCallback(
    (id: number) => {
      seenIdsRef.current.add(id)

      // Debounce 2s — только если dropdown открыт (B4 req 4.4)
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

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      cancelDebounce()
    }
  }, [cancelDebounce])

  return { addSeenId, flushNow: flush }
}
