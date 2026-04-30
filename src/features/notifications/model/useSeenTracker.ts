'use client'
import { useCallback, useEffect, useRef } from 'react'

const VISIBILITY_THRESHOLD = 0.6
const SEEN_DURATION_MS = 5000

export interface UseSeenTrackerOptions {
  /** id → DOM-элемент уведомления */
  itemRefs: React.RefObject<Map<number, HTMLElement>>
  /** Список id непрочитанных уведомлений для отслеживания */
  unreadIds: number[]
  /** Dropdown открыт */
  isOpen: boolean
  /** Вызывается когда item удовлетворил критерию seen */
  onSeen: (id: number) => void
}

/**
 * B4: Отслеживает видимость уведомлений через IntersectionObserver.
 *
 * Критерий seen:
 *   - visibility >= 60%  (threshold: 0.6)
 *   - суммарное время видимости >= 5000ms (cumulative, не непрерывное)
 *
 * Fallback при отсутствии IntersectionObserver:
 *   - onSeen вызывается только при явном клике (см. NotificationButton onNotificationClick)
 */
export function useSeenTracker({
  itemRefs,
  unreadIds,
  isOpen,
  onSeen,
}: UseSeenTrackerOptions): void {
  // cumulative visible time per id (ms)
  const cumulativeTimeRef = useRef<Map<number, number>>(new Map())
  // timestamp когда item стал видимым (для текущего intersection)
  const visibleSinceRef = useRef<Map<number, number>>(new Map())
  // ids уже помеченные как seen — не вызываем onSeen повторно
  const seenIdsRef = useRef<Set<number>>(new Set())
  const onSeenRef = useRef(onSeen)

  useEffect(() => {
    onSeenRef.current = onSeen
  })

  // Сброс при закрытии dropdown
  useEffect(() => {
    if (!isOpen) {
      visibleSinceRef.current.clear()
    }
  }, [isOpen])

  // Сброс при смене списка непрочитанных (новая загрузка)
  useEffect(() => {
    seenIdsRef.current = new Set()
    cumulativeTimeRef.current = new Map()
    visibleSinceRef.current = new Map()
  }, [unreadIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  const observe = useCallback(() => {
    if (!isOpen) {
      return
    }

    // Fallback: IntersectionObserver недоступен
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
            // Начало видимости
            if (!visibleSinceRef.current.has(id)) {
              visibleSinceRef.current.set(id, now)
            }
          } else {
            // Конец видимости — накапливаем время
            const since = visibleSinceRef.current.get(id)

            if (since !== undefined) {
              const prev = cumulativeTimeRef.current.get(id) ?? 0
              const elapsed = now - since

              cumulativeTimeRef.current.set(id, prev + elapsed)
              visibleSinceRef.current.delete(id)
            }
          }

          // Проверяем накопленное время
          const cumulative = cumulativeTimeRef.current.get(id) ?? 0

          if (cumulative >= SEEN_DURATION_MS && !seenIdsRef.current.has(id)) {
            seenIdsRef.current.add(id)
            onSeenRef.current(id)
          }
        }
      },
      { threshold: VISIBILITY_THRESHOLD }
    )

    // Наблюдаем за всеми непрочитанными элементами
    for (const id of unreadIds) {
      const el = refs.get(id)

      if (el) {
        observer.observe(el)
      }
    }

    // Интервал для проверки накопленного времени у видимых items
    const interval = setInterval(() => {
      const now = Date.now()

      for (const [id, since] of visibleSinceRef.current.entries()) {
        if (seenIdsRef.current.has(id)) {
          continue
        }
        const prev = cumulativeTimeRef.current.get(id) ?? 0
        const cumulative = prev + (now - since)

        if (cumulative >= SEEN_DURATION_MS) {
          // Обновляем накопленное время и помечаем как seen
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
  }, [isOpen, unreadIds, itemRefs])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = observe()

    return cleanup
  }, [observe])
}
