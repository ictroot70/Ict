import React, { RefObject, useEffect } from 'react'

interface Props {
  hasNextPage: boolean
  onLoadMore: () => void
  rootRef?: RefObject<Element | null>
  rootMargin?: string
  threshold?: number
}

export const useInfiniteScroll = ({
  hasNextPage,
  rootRef,
  rootMargin = '100px',
  threshold = 0.1,
  onLoadMore,
}: Props) => {
  const observerRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.length > 0 && entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { root: rootRef?.current ?? null, rootMargin, threshold }
    )

    const currentRef = observerRef.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [onLoadMore, hasNextPage, rootMargin, rootRef, threshold])

  return { observerRef }
}
