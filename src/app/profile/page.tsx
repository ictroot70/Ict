'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { redirect } from 'next/navigation'

export default function ProfileRedirect() {
  const { user } = useAuth()

  if (!user) {
    redirect('/')
  }

  redirect(`/profile/${user.userId}`)
}
