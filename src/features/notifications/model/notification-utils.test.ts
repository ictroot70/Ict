import { describe, expect, it } from 'vitest'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

function isWithinOneMonth(dateStr: string): boolean {
  const date = new Date(dateStr).getTime()

  if (Number.isNaN(date)) {
    return false
  }
  const cutoff = Date.now() - MONTH_MS

  return date >= cutoff
}

function dedupeAppendNew(newItems: { id: number }[], existing: { id: number }[]) {
  const existingIds = new Set(existing.map(i => i.id))

  return newItems.filter(i => !existingIds.has(i.id))
}

describe('notification utils', () => {
  describe('isWithinOneMonth', () => {
    it('returns true for a recent notification (1 day ago)', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      expect(isWithinOneMonth(oneDayAgo)).toBe(true)
    })

    it('returns true for a notification at the boundary (29 days ago)', () => {
      const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()

      expect(isWithinOneMonth(twentyNineDaysAgo)).toBe(true)
    })

    it('returns false for an old notification (31 days ago)', () => {
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()

      expect(isWithinOneMonth(thirtyOneDaysAgo)).toBe(false)
    })

    it('returns false for an invalid date string', () => {
      expect(isWithinOneMonth('not-a-date')).toBe(false)
    })
  })

  describe('dedupeAppendNew', () => {
    it('returns only items that are not already in existing list', () => {
      const existing = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const newItems = [
        { id: 2 }, // duplicate
        { id: 4 }, // new
        { id: 5 }, // new
      ]

      const result = dedupeAppendNew(newItems, existing)

      expect(result).toEqual([{ id: 4 }, { id: 5 }])
    })

    it('returns all items when there are no duplicates', () => {
      const existing = [{ id: 1 }]
      const newItems = [{ id: 2 }, { id: 3 }]

      const result = dedupeAppendNew(newItems, existing)

      expect(result).toEqual([{ id: 2 }, { id: 3 }])
    })

    it('returns empty array when all items are duplicates', () => {
      const existing = [{ id: 1 }, { id: 2 }]
      const newItems = [{ id: 1 }, { id: 2 }]

      const result = dedupeAppendNew(newItems, existing)

      expect(result).toEqual([])
    })
  })
})
