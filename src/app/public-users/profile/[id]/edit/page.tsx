'use client'
import { RequireAuth } from '@/features/auth/ui'

function EditProfile() {
  return (
    <div>
      <h1>Edit Profile</h1>
    </div>
  )
}

export default function Page() {
  return (
    <RequireAuth>
      <EditProfile />
    </RequireAuth>
  )
}
