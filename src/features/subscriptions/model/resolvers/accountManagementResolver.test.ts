import { describe, it, expect } from 'vitest'

import { resolveAccountManagementView } from './accountManagementResolver'

describe('resolveAccountManagementView', () => {
  it('returns personal for personal account', () => {
    expect(
      resolveAccountManagementView({
        accountType: 'personal',
        hasActiveSubscription: false,
      })
    ).toBe('personal')
  })

  it('returns business-no-subscription for business without subscription', () => {
    expect(
      resolveAccountManagementView({
        accountType: 'business',
        hasActiveSubscription: false,
      })
    ).toBe('business-no-subscription')
  })

  it('returns business-active-subscription for business with subscription', () => {
    expect(
      resolveAccountManagementView({
        accountType: 'business',
        hasActiveSubscription: true,
      })
    ).toBe('business-active-subscription')
  })
})
