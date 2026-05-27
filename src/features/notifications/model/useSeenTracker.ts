'use client'
import React, { useCallback, useEffect, useRef } from 'react'

const VISIBILITY_THRESHOLD = 0.6
const SEEN_DURATION_MS = 5000

export interface UseSeenTrackerOptions {
  itemRefs: React.RefObject<Map<number, HTMLElement>>
  unreadIds: number[]
  isOpen: boolean
  onSeen: (id: number) => void
}
export function useSeenTracker({
  itemRefs,
  unreadIds,
  isOpen,
  onSeen,
}: UseSeenTrackerOptions): void {
  const cumulativeTimeRef = useRef<Map<number, number>>(new Map())
  const visibleSinceRef = useRef<Map<number, number>>(new Map())
  const seenIdsRef = useRef<Set<number>>(new Set())
  const onSeenRef = useRef(onSeen)

  useEffect(() => {
    onSeenRef.current = onSeen
  })

  useEffect(() => {
    if (!isOpen) {
      visibleSinceRef.current.clear()
    }
  }, [isOpen])

  useEffect(() => {
    seenIdsRef.current = new Set()
    cumulativeTimeRef.current = new Map()
    visibleSinceRef.current = new Map()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadIds.join(',')])

  const observe = useCallback(() => {
    if (!isOpen) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    const refs = itemRefs.current

    if (!refs) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const now = Date.now()

        for (const entry of entries) {
          const id = Number((entry.target as HTMLElement).dataset['notificationId'])

          if (!id || seenIdsRef.current.has(id)) {
            continue
          }

          if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
            if (!visibleSinceRef.current.has(id)) {
              visibleSinceRef.current.set(id, now)
            }
          } else {
            const since = visibleSinceRef.current.get(id)

            if (since !== undefined) {
              const prev = cumulativeTimeRef.current.get(id) ?? 0
              const elapsed = now - since

              cumulativeTimeRef.current.set(id, prev + elapsed)
              visibleSinceRef.current.delete(id)
            }
          }

          const cumulative = cumulativeTimeRef.current.get(id) ?? 0

          if (cumulative >= SEEN_DURATION_MS && !seenIdsRef.current.has(id)) {
            seenIdsRef.current.add(id)
            onSeenRef.current(id)
          }
        }
      },
      { threshold: VISIBILITY_THRESHOLD }
    )

    for (const id of unreadIds) {
      const el = refs.get(id)

      if (el) {
        observer.observe(el)
      }
    }

    const interval = setInterval(() => {
      const now = Date.now()

      for (const [id, since] of visibleSinceRef.current.entries()) {
        if (seenIdsRef.current.has(id)) {
          continue
        }
        const prev = cumulativeTimeRef.current.get(id) ?? 0
        const cumulative = prev + (now - since)

        if (cumulative >= SEEN_DURATION_MS) {
          cumulativeTimeRef.current.set(id, cumulative)
          visibleSinceRef.current.delete(id)
          seenIdsRef.current.add(id)
          onSeenRef.current(id)
        }
      }
    }, 500)

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [isOpen, unreadIds, itemRefs])

  useEffect(() => {
    const cleanup = observe()

    return cleanup
  }, [observe])
}
