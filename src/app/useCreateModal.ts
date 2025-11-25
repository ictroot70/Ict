import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PostViewModel } from '@/shared/types'

export const useCreateModal = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const action = useMemo(() => searchParams.get('action'), [searchParams])
  const isOpen = action === 'create'

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('action')
    const queryString = params.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  const handlePublish = useCallback(
    (_post: PostViewModel) => {
      close()
    },
    [close]
  )

  return {
    isOpen,
    close,
    handlePublish,
  }
}
