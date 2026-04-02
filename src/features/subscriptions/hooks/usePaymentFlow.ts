'use client'

import { useEffect, useState } from 'react'

import { useCreateSubscriptionMutation } from '@/features/subscriptions'
import { PaymentFlowState, PaymentFlowStatus } from '@/features/subscriptions/model'
import { APP_ROUTES } from '@/shared/constant'
import { CreateSubscriptionInputDto } from '@/shared/types'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export function usePaymentFlow(): PaymentFlowState {
  const [flowStatus, setFlowStatus] = useState<PaymentFlowStatus>('idle')
  const [flowErrorCode, setFlowErrorCode] = useState<null | string>(null)

  const [createSubscription, { isLoading: isStarting }] = useCreateSubscriptionMutation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const accountPath = APP_ROUTES.PROFILE.ACCOUNT(Number(params.id))

  useEffect(() => {
    // TODO(T2 integration): синхронизировать с финальной схемой статуса платежа из T2
    const status = searchParams.get('success')

    if (status === 'true') {
      setFlowStatus('success')
      setFlowErrorCode(null)
    } else if (status === 'false') {
      setFlowStatus('failure')
    } else {
      setFlowStatus('idle')
    }
  }, [searchParams])

  const startPayment = async (input: CreateSubscriptionInputDto) => {
    if (isStarting) {
      return
    }

    try {
      const result = await createSubscription(input).unwrap()

      window.location.assign(result.url)
    } catch {
      setFlowStatus('failure')
      setFlowErrorCode('SUBSCRIPTION_CREATE_FAILED')
    }
  }

  const resetFlow = () => {
    setFlowStatus('idle')
    setFlowErrorCode(null)

    if (searchParams.get('success')) {
      router.replace(accountPath)
    }
  }

  return {
    flowStatus,
    flowErrorCode,
    isStarting,
    startPayment,
    resetFlow,
  }
}
