import { SubscriptionType } from '@/shared/types'

export type SubscriptionTypeLabel = '1 day' | '1 month' | '7 days'

const assertNever = (value: never): never => {
  throw new Error(`Unsupported subscription type: ${String(value)}`)
}

export const mapSubscriptionTypeToLabel = (type: SubscriptionType): SubscriptionTypeLabel => {
  switch (type) {
    case SubscriptionType.DAY:
      return '1 day'
    case SubscriptionType.WEEKLY:
      return '7 days'
    case SubscriptionType.MONTHLY:
      return '1 month'
    default:
      return assertNever(type)
  }
}
