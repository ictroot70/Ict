import { Suspense } from 'react'

import SignInFormContainer from '@/app/(public)/auth/login/SignInFormContainer'
import { Loading } from '@/shared/composites/Loading'

export default function SingIn() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInFormContainer />
    </Suspense>
  )
}
