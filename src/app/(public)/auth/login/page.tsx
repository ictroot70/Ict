import { Suspense } from 'react'

import SignInFormContainer from '@/app/(public)/auth/login/SignInFormContainer'
import { Loading } from '@/shared/composites/Loading'
import { GuestGuard } from '@/shared/guards'

export default function SingIn() {
  return (
    <Suspense fallback={<Loading />}>
      <GuestGuard>
        <SignInFormContainer />
      </GuestGuard>
    </Suspense>
  )
}
