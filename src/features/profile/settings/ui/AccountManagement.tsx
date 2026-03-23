import { SubscriptionPricing } from '@/features/subscriptions'

export function AccountManagement() {
  // Account tab only: pricing preview belongs to Account Management, not to My Payments.
  return <SubscriptionPricing />
}
