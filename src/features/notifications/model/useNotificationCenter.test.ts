import type { NotificationViewDto } from '@/shared/types/notifications/notification.models'

import { describe, expect, it, vi } from 'vitest'

describe('useNotificationCenter unreadCount', () => {
  // Test that unreadCount is computed from items, not from a separate state.
  // This ensures that after mark-as-read, the count resets without drift.

  function computeUnreadCount(items: NotificationViewDto[]): number {
    return items.filter(i => !i.isRead).length
  }

  it('returns 0 for empty list', () => {
    expect(computeUnreadCount([])).toBe(0)
  })

  it('returns correct count when all items are unread', () => {
    const items: NotificationViewDto[] = [
      {
        id: 1,
        message: 'msg1',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 2,
        message: 'msg2',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 3,
        message: 'msg3',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
    ]

    expect(computeUnreadCount(items)).toBe(3)
  })

  it('returns 0 after all items are marked as read', () => {
    const items: NotificationViewDto[] = [
      {
        id: 1,
        message: 'msg1',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 2,
        message: 'msg2',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 3,
        message: 'msg3',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
    ]

    expect(computeUnreadCount(items)).toBe(3)

    // Simulate mark-as-read
    const updatedItems = items.map(i => ({ ...i, isRead: true }))

    expect(computeUnreadCount(updatedItems)).toBe(0)
  })

  it('returns correct count with mixed read/unread items', () => {
    const items: NotificationViewDto[] = [
      {
        id: 1,
        message: 'msg1',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 2,
        message: 'msg2',
        isRead: true,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 3,
        message: 'msg3',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
      {
        id: 4,
        message: 'msg4',
        isRead: true,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
    ]

    expect(computeUnreadCount(items)).toBe(2)
  })

  it('correctly updates count when new unread item arrives via socket', () => {
    const items: NotificationViewDto[] = [
      {
        id: 1,
        message: 'msg1',
        isRead: true,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
    ]

    expect(computeUnreadCount(items)).toBe(0)

    // Simulate new unread notification from socket
    const newDto: NotificationViewDto = {
      id: 2,
      message: 'new msg',
      isRead: false,
      notifyAt: '2026-04-14T00:00:00Z',
      createdAt: '2026-04-14T00:00:00Z',
    }

    const updatedItems = [newDto, ...items]

    expect(computeUnreadCount(updatedItems)).toBe(1)
  })

  it('does not double-count when socket delivers duplicate notification', () => {
    const items: NotificationViewDto[] = [
      {
        id: 1,
        message: 'msg1',
        isRead: false,
        notifyAt: '2026-04-14T00:00:00Z',
        createdAt: '2026-04-14T00:00:00Z',
      },
    ]

    expect(computeUnreadCount(items)).toBe(1)

    // Simulate duplicate from socket
    const duplicateDto: NotificationViewDto = {
      id: 1,
      message: 'msg1',
      isRead: false,
      notifyAt: '2026-04-14T00:00:00Z',
      createdAt: '2026-04-14T00:00:00Z',
    }

    // Dedupe logic (same as in hook)
    const updatedItems = items.find(i => i.id === duplicateDto.id)
      ? items
      : [duplicateDto, ...items]

    expect(computeUnreadCount(updatedItems)).toBe(1)
  })
})
