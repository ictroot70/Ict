import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { parsePaymentReturn } from '../lib/returnQuery'
import { pollUntilSubscriptionUpdated, type PollOutcome } from '../lib/paymentPolling'
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
  const baselineRef = useRef<ActiveSubscriptionViewModel[]>([])
  const handledRef = useRef(false)

  useEffect(() => {
    const returnStatus = parsePaymentReturn(searchParams)

    if (!returnStatus || handledRef.current) return
    handledRef.current = true

    // cleanup query params immediately
    router.replace(pathname)

    if (returnStatus === 'failed') {
      setFlowStatus('failed')

      return
    }

    // start polling
    setFlowStatus('polling')
    pollUntilSubscriptionUpdated(fetchSubscriptions, baselineRef.current).then(
      (outcome: PollOutcome) => {
        setFlowStatus(outcome === 'success' ? 'success' : 'timeout')
      }
    )
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
