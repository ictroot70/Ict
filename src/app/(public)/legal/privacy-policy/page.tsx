import { Suspense } from 'react'

import { PrivacyOfPolicy } from '@/features/legal'
import { Loading } from '@/shared/composites/Loading'

export default function PrivacyOfPolicyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PrivacyOfPolicy />
    </Suspense>
  )
}
