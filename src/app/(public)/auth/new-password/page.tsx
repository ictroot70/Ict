import { Suspense } from 'react'

import { Loading } from '@/shared/composites/Loading'

import NewPasswordContainer from './NewPasswordContainer'

export default function NewPassword() {
  return (
    <Suspense fallback={<Loading />}>
      <NewPasswordContainer />
    </Suspense>
  )
}
