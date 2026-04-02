import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { parsePaymentReturn } from '../lib/returnQuery'
import { pollUntilSubscriptionUpdated, type PollOutcome } from '../lib/paymentPolling'
import { paymentPending } from '../lib/paymentPending'
import { paymentBaseline } from '../lib/paymentBaseline'
import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

export type FlowStatus = 'idle' | 'polling' | 'success' | 'failed' | 'timeout'

interface UsePaymentReturnFlowOptions {
  fetchSubscriptions: () => Promise<ActiveSubscriptionViewModel[]>
}

interface UsePaymentReturnFlowResult {
  flowStatus: FlowStatus
  isPolling: boolean
  resetFlow: () => void
}

export function usePaymentReturnFlow({
  fetchSubscriptions,
}: UsePaymentReturnFlowOptions): UsePaymentReturnFlowResult {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle')
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const returnStatus = parsePaymentReturn(searchParams)
    const isPending = paymentPending.get()

    // success=false → failed, без polling
    if (returnStatus === 'failed') {
      router.replace(pathname)
      paymentPending.clear()
      paymentBaseline.clear()
      setFlowStatus('failed')

      return
    }

    // success отсутствует + pending=false → обычный вход, ничего не делаем
    if (returnStatus === null && !isPending) {
      return
    }

    // success=true ИЛИ (success отсутствует + pending=true) → polling
    router.replace(pathname)
    paymentPending.clear()

    const baseline = paymentBaseline.get()

    setFlowStatus('polling')
    pollUntilSubscriptionUpdated(fetchSubscriptions, baseline)
      .then((outcome: PollOutcome) => {
        setFlowStatus(outcome === 'success' ? 'success' : 'timeout')
      })
      .catch(() => {
        setFlowStatus('failed')
      })
      .finally(() => {
        paymentPending.clear()
        paymentBaseline.clear()
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetFlow = () => {
    handledRef.current = false
    setFlowStatus('idle')
  }

  return {
    flowStatus,
    isPolling: flowStatus === 'polling',
    resetFlow,
  }
}
