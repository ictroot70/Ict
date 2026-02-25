'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMeQuery } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'

export default function ProfileRedirect() {
  const { data: user } = useMeQuery()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(APP_ROUTES.ROOT)
    } else {
      router.push(APP_ROUTES.PROFILE.ID(user.userId))
    }
  }, [user, router])

  return <Loading />
}
