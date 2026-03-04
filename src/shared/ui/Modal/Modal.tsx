'use client'

import { useLayoutEffect } from 'react'

import { Modal as UIKitModal, type ModalProps } from '@ictroot/ui-kit'

type ScrollLockSnapshot = {
  scrollY: number
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  bodyOverflow: string
  bodyPaddingRight: string
}

let activeLocks = 0
let snapshot: ScrollLockSnapshot | null = null

const lockBodyScroll = () => {
  if (typeof window === 'undefined') {
    return
  }

  const { body } = document

  if (activeLocks === 0) {
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    snapshot = {
      scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    }

    if (scrollbarWidth > 0) {
      const computedPaddingRight =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0

      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
  }

  activeLocks += 1
}

const unlockBodyScroll = () => {
  if (typeof window === 'undefined' || activeLocks === 0) {
    return
  }

  activeLocks -= 1

  if (activeLocks > 0) {
    return
  }

  const { body } = document

  if (snapshot) {
    const { scrollY } = snapshot

    body.style.position = snapshot.bodyPosition
    body.style.top = snapshot.bodyTop
    body.style.left = snapshot.bodyLeft
    body.style.right = snapshot.bodyRight
    body.style.width = snapshot.bodyWidth
    body.style.overflow = snapshot.bodyOverflow
    body.style.paddingRight = snapshot.bodyPaddingRight

    window.scrollTo(0, scrollY)
  }

  snapshot = null
}

const useBodyScrollLock = (open: boolean) => {
  useLayoutEffect(() => {
    if (!open) {
      return
    }

    lockBodyScroll()

    return () => {
      unlockBodyScroll()
    }
  }, [open])
}

export const Modal = ({ open, ...props }: ModalProps) => {
  useBodyScrollLock(open)

  return <UIKitModal open={open} {...props} />
}

export type { ModalProps }
