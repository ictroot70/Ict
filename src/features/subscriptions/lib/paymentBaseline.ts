import type { ActiveSubscriptionViewModel } from '@/shared/types/payments/models'

const KEY = 'payment_baseline'

export const paymentBaseline = {
  set: (data: ActiveSubscriptionViewModel[]) =>
    sessionStorage.setItem(KEY, JSON.stringify(data)),
  get: (): ActiveSubscriptionViewModel[] => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  },
  clear: () => sessionStorage.removeItem(KEY),
}
