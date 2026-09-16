import { RefObject } from 'react'

import { useInfiniteScroll } from '@/shared/hooks'

type Prop = {
  hasNextPage: boolean
  onLoadMore: () => void
  rootRef?: RefObject<Element | null>
}

export const InfiniteScrollTrigger = ({ hasNextPage, onLoadMore, rootRef }: Prop) => {
  const { observerRef } = useInfiniteScroll({ hasNextPage, onLoadMore, rootRef })

  if (!hasNextPage) {
    return null
  }

  return <div ref={observerRef} style={{ height: '2px' }}></div>
}
