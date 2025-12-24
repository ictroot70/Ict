'use client'
import { useMeQuery } from '@/features/auth'
import { redirect } from 'next/navigation'

export default function ProfileRedirect() {
  const { data: user } = useMeQuery()

  if (!user) {
    redirect('/')
  }

  redirect(`/profile/${user.userId}`)
}
