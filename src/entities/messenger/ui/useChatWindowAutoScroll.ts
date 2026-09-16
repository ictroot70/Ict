'use client'

import type { VirtuosoHandle } from 'react-virtuoso'

import { useCallback, useEffect, useRef } from 'react'

import { isIncomingMessage, type MessageViewModel } from '@/entities/messenger'

interface UseChatWindowAutoScrollOptions {
  currentUserId: number
  firstItemIndex: number
  messages: readonly MessageViewModel[]
}

/**
 * Keeps a virtualized (react-virtuoso) chat list scrolled to the bottom in the two cases where
 * `followOutput` alone isn't enough:
 *
 * 1. On first load of a dialogue (including async-loaded history), once messages become
 *    available — `followOutput` only reacts to *changes*, it doesn't position an already
 *    -mounted list.
 * 2. Whenever *this* user sends a message (text, image, or voice all end up appended as the
 *    last item via the optimistic-send flow) — `followOutput` deliberately does not force-
 *    scroll when the viewport isn't already near the bottom, so it wouldn't fire if the user
 *    was reading older history when they hit send.
 *
 * IMPORTANT: when Virtuoso's `firstItemIndex` prop is non-zero (the common case here, since
 * only the latest page of history loads up front), `scrollToIndex`'s `index` must be given in
 * the same "global" numbering as `firstItemIndex` — a plain position within the `messages`
 * array targets an arbitrary, usually wrong row.
 */
export function useChatWindowAutoScroll({
  currentUserId,
  firstItemIndex,
  messages,
}: UseChatWindowAutoScrollOptions) {
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const didScrollToInitialMessageRef = useRef(false)
  const lastOwnMessageIdRef = useRef<number | null>(null)
  // Captured once, on the very first render, so effect 2 (below) can tell "this outgoing
  // message was already the last one at mount — effect 1 already scrolled for it" apart from
  // "this outgoing message is genuinely new". Comparing against `lastOwnMessageIdRef.current
  // === null` instead (i.e. "have we ever seen any outgoing last message before") is NOT an
  // equivalent check: it also matches the legitimate case where the dialogue opened with an
  // *incoming* last message and the user's first send afterwards becomes the very first
  // outgoing message ever observed — that send must still scroll, and treating it as "already
  // handled at mount" was a real bug caught by this hook's own tests.
  const initialLastMessageIdRef = useRef(messages[messages.length - 1]?.id ?? null)

  const scrollToLastMessage = useCallback(
    (behavior: 'auto' | 'smooth') => {
      const targetIndex = firstItemIndex + messages.length - 1

      // A double rAF (not just one) gives the browser a chance to fully flush layout for the
      // just-rendered rows before asking Virtuoso to scroll — a single frame can still land
      // mid-layout for image/voice bubbles whose height isn't settled yet.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          virtuosoRef.current?.scrollToIndex({ align: 'end', behavior, index: targetIndex })
        })
      })
    },
    [firstItemIndex, messages.length]
  )

  useEffect(() => {
    if (didScrollToInitialMessageRef.current || messages.length === 0) {
      return
    }

    didScrollToInitialMessageRef.current = true
    scrollToLastMessage('auto')
  }, [messages.length, scrollToLastMessage])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || isIncomingMessage(lastMessage, currentUserId)) {
      return
    }

    if (lastOwnMessageIdRef.current === lastMessage.id) {
      return
    }

    lastOwnMessageIdRef.current = lastMessage.id

    if (lastMessage.id === initialLastMessageIdRef.current) {
      return
    }

    scrollToLastMessage('smooth')
  }, [currentUserId, messages, scrollToLastMessage])

  return virtuosoRef
}
