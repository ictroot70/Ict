import React, { useEffect } from 'react'

interface Props {
  hasNextPage: boolean
  onLoadMore: () => void
  rootMargin?: string
  threshold?: number
}

export const useInfiniteScroll = ({
  hasNextPage,
  rootMargin = '50px',
  threshold = 0.1,
  onLoadMore,
}: Props) => {
  const observerRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries.length > 0 && entries[0].isIntersecting && hasNextPage) {
          onLoadMore()
        }
      },
      { root: null, rootMargin, threshold }
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
  }, [onLoadMore, hasNextPage])

  return { observerRef }
}
