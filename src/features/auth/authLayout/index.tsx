'use client'
import { PropsWithChildren, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMeQuery } from '@/features/auth/api/authApi'
import { Loading } from '@/shared/ui'
import { ROUTES } from '@/shared/constant/routes'

export function RequireAuth({ children }: PropsWithChildren) {
  const { data, isLoading, isError } = useMeQuery()
  const router = useRouter()

  useEffect(() => {
    if (isError) {
      router.replace(ROUTES.AUTH.LOGIN)
    }
  }, [isError, router])

  if (isLoading || !data) {
    return <Loading />
  }
  if (isError) {
    return null
  }

  return <div className="container">{children}</div>
}
