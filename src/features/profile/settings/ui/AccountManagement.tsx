'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  AutoRenewModal,
  PaymentFailureModal,
  PaymentSuccessModal,
  SubscriptionPricing,
  useCreateSubscriptionMutation,
} from '@/features/subscriptions'
import { PaymentType, SubscriptionType } from '@/shared/types'
import { Button } from '@/shared/ui'

export function AccountManagement() {
  const [isAutoRenewOpen, setIsAutoRenewOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isFailureOpen, setIsFailureOpen] = useState(false)

  const [createSubscription] = useCreateSubscriptionMutation()

  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ id: string }>()

  useEffect(() => {
    const status = searchParams.get('success')

    if (status === 'true') {
      setIsSuccessOpen(true)
    }

    if (status === 'false') {
      setIsFailureOpen(true)
    }

    if (status) {
      router.replace(`/profile/${params.id}/settings/account`)
    }
  }, [params.id, router, searchParams])

  const handleConfirmAutoRenew = async () => {
    // TEST: Request to create subscription with Stripe, then redirect to the payment page
    const result = await createSubscription({
      typeSubscription: SubscriptionType.DAY,
      paymentType: PaymentType.STRIPE,
      amount: 10,
      baseUrl: `${window.location.origin}/profile/${params.id}/settings/account`,
    }).unwrap()

    window.location.href = result.url
  }

  return (
    <>
      <SubscriptionPricing />

      <Button onClick={() => setIsAutoRenewOpen(true)}>Stripe</Button>

      <AutoRenewModal
        open={isAutoRenewOpen}
        onClose={() => setIsAutoRenewOpen(false)}
        onConfirm={handleConfirmAutoRenew}
      />

      <PaymentSuccessModal open={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />

      <PaymentFailureModal
        open={isFailureOpen}
        onClose={() => setIsFailureOpen(false)}
        onBackToPayment={() => {
          setIsFailureOpen(false)
          setIsAutoRenewOpen(true)
        }}
      />
    </>
  )
}
