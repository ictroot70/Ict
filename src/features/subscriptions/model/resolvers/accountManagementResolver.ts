export type AccountManagementView =
  | 'personal'
  | 'business-no-subscription'
  | 'business-active-subscription'

export interface ResolveViewParams {
  accountType: 'personal' | 'business'
  hasActiveSubscription: boolean
}

export const resolveAccountManagementView = ({
  accountType,
  hasActiveSubscription,
}: ResolveViewParams): AccountManagementView => {
  if (accountType === 'personal') {
    return 'personal'
  }

  if (accountType === 'business' && !hasActiveSubscription) {
    return 'business-no-subscription'
  }

  return 'business-active-subscription'
}
