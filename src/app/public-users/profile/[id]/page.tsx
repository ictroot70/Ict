'use client'
import { useParams } from 'next/navigation'
import { RequireAuth } from '@/features/auth/authLayout'
import s from './Profile.module.scss'

export default function Profile() {
  const params = useParams()
  const userId = params?.id
  return (
    <RequireAuth>
      <div className={s.profile}>
        <h1>My Profile</h1>
        <p>My id is: {userId}</p>
      </div>
    </RequireAuth>
  )
}
