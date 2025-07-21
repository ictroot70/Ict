'use client'
import { useParams } from 'next/navigation'
import { useGetMyProfileQuery } from '@/entities/profile/api/profile.api'
import { AuthGuard } from '@/shared/guards'

export default function Profile() {
  const params = useParams()
  const { data, isSuccess } = useGetMyProfileQuery()
  const userId = params?.id
  console.log('userId', userId)
  return (
    <AuthGuard>
      {isSuccess && (
        <div>
          <h1>My Profile</h1>
          <p>My id is: {userId}</p>
          <p>My userName is: {data?.userName}</p>
          <p>My firstName is: {data?.firstName}</p>
          <p>My lastName is: {data?.lastName}</p>
          <p>My country is: {data?.country}</p>
          <p>My city is: {data?.city}</p>
          <p>My region is: {data?.region}</p>
        </div>
      )}
    </AuthGuard>
  )
}
