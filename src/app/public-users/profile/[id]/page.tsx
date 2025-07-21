'use client'
import { useParams } from 'next/navigation'
import { AuthGuard } from '@/shared/guards'

export default function Profile() {
  const params = useParams()
  const userId = params?.id
  return (
    <AuthGuard>
      <div>
        <h1>My Profile</h1>
        <p>My id is: {userId}</p>
      </div>
    </AuthGuard>
  )
}
