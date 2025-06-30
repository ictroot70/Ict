import { PropsWithChildren, useEffect } from 'react'
import { useMeQuery } from '@/services/ict.api'
import { useRouter } from 'next/navigation'
import { Loading } from '@/shared'

export function RequireAuth({ children }: PropsWithChildren) {
  const { isLoading, isError, isSuccess } = useMeQuery()
  const router = useRouter()
  useEffect(() => {
    if (!isError) {
      return
    }
    void router.push('/auth/login')
  }, [isError, router])

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return null
  }
  console.log('isSuccess', isSuccess)

  return <div className="container">{children}</div>
}
