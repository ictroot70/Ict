'use client'

import { AuthGuard } from '@/shared/guards'

function EditProfile() {
  return (
    <div>
      <h1>Edit Profile</h1>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <EditProfile />
    </AuthGuard>
  )
}
