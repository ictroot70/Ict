'use client'

import { useEffect, useState } from 'react'

import { useCreateSubscriptionMutation } from '@/features/subscriptions'
import { APP_ROUTES } from '@/shared/constant'
import { PaymentType, SubscriptionType } from '@/shared/types'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export function useAccountManagement() {
  const [modal, setModal] = useState<null | 'auto' | 'success' | 'failure'>(null)
  const [createSubscription, { isLoading: isSubmitting }] = useCreateSubscriptionMutation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const accountPath = APP_ROUTES.PROFILE.ACCOUNT(Number(params.id))

  useEffect(() => {
    const status = searchParams.get('success')

    if (status === 'true') {
      setModal('success')
    }
    if (status === 'false') {
      setModal('failure')
    }
  }, [searchParams])

  const confirmAutoRenew = async () => {
    if (isSubmitting) {
      return
    }
    try {
      const result = await createSubscription({
        typeSubscription: SubscriptionType.DAY,
        paymentType: PaymentType.STRIPE,
        amount: 10,
        baseUrl: `${window.location.origin}${accountPath}`,
      }).unwrap()

      window.location.href = result.url
    } catch {
      setModal('failure')
    }
  }

  const closeModal = () => {
    setModal(null)
    if (searchParams.get('success')) {
      router.replace(accountPath)
    }
  }

  return { modal, setModal, confirmAutoRenew, isSubmitting, closeModal }
}
