import { useInfiniteScroll } from '@/shared/hooks'

type Prop = {
  hasNextPage: boolean
  onLoadMore: () => void
}

export const InfiniteScrollTrigger = ({ hasNextPage, onLoadMore }: Prop) => {
  const { observerRef } = useInfiniteScroll({ hasNextPage, onLoadMore })

  if (!hasNextPage) return null

  return <div ref={observerRef} style={{ height: '2px', backgroundColor: 'red' }}></div>
}
