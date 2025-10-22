'use client'
import { redirect } from 'next/navigation'
import { useAuth } from '@/features/posts/utils/useAuth'

export default function ProfileRedirect() {
  const { user: myProfile } = useAuth()

  if (!myProfile) {
    redirect('/')
  }

  redirect(`/profile/${myProfile.userId}`)
}
