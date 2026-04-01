'use client'

import { useEffect, useState } from 'react'

import { useCreateSubscriptionMutation } from '@/features/subscriptions'
import { PaymentFlowState, PaymentFlowStatus } from '@/features/subscriptions/model'
import { APP_ROUTES } from '@/shared/constant'
import { PaymentType, SubscriptionType } from '@/shared/types'
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

  const startPayment = async () => {
    if (isStarting) {
      return
    }

    try {
      // TODO(T2 integration): заменить временный payload на данные из выбранного плана
      const result = await createSubscription({
        typeSubscription: SubscriptionType.DAY,
        paymentType: PaymentType.STRIPE,
        amount: 10,
        baseUrl: `${window.location.origin}${accountPath}`,
      }).unwrap()

      window.location.href = result.url
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
