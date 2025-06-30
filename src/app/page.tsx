'use client'

import { useGetPublicUsersQuery, useMeQuery } from '@/services/ict.api'
import { SignInForm } from '@/features/auth'
import { Loading } from '@/shared'

export default function Home() {
  const { isLoading, isError, error, data: counter, isSuccess } = useGetPublicUsersQuery()
  console.log('counter', counter)
  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    console.error('ME query error:', error)
    return <div>Something went wrong</div>
  }
  if (!counter) {
    return null
  }

  return (
    <div>
      <h1>All users: {counter.totalCount}</h1>
    </div>
  )
}
