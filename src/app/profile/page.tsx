'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { redirect } from 'next/navigation'

export default function ProfileRedirect() {
  const { user: myProfile } = useAuth()

  if (!myProfile) {
    redirect('/')
  }

  redirect(`/profile/${myProfile.userId}`)
}
