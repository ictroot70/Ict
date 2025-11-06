'use client'

import MyProfile from '@/entities/profile/ui/MyProfile/MyProfile'
import PublicUser from '@/entities/profile/ui/PublicProfile/PublicProfile'
import UserProfile from '@/entities/profile/ui/UserProfile/UserProfile'
import { useAuth } from '@/features/posts/utils/useAuth'
import { Loading } from '@/shared/composites'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Loading />
  if (Number.isNaN(userId))
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        Invalid user ID
      </div>
    )

  if (!isAuthenticated) return <PublicUser id={userId} />

  return userId === user?.userId ? <MyProfile /> : <UserProfile id={userId} />
}
