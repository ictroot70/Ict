'use client'

import MyProfile from '@/entities/profile/ui/MyProfile/MyProfile'
import PublicUser from '@/entities/profile/ui/PublicProfile/PublicProfile'
import UserProfile from '@/entities/profile/ui/UserProfile/UserProfile'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Loading } from '@/shared/composites'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Loading />
  if (!isAuthenticated) return <PublicUser id={id} />

  return +id === user?.userId ? <MyProfile /> : <UserProfile id={id} />
}
