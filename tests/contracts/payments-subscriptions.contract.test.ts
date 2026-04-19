import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('PAYMENTS-UC1-PAID-ACCOUNT-PURCHASE', () => {
  it('keeps subscriptions API route map aligned with swagger endpoints', () => {
    const source = readSource('src/shared/api/api-routes.ts')

    expect(source).toContain("CREATE: '/v1/subscriptions'")
    expect(source).toContain("CANCEL_AUTO_RENEWAL: '/v1/subscriptions/canceled-auto-renewal'")
    expect(source).toContain("COST_OF_PAYMENT: '/v1/subscriptions/cost-of-payment-subscriptions'")
    expect(source).toContain("CURRENT_PAYMENT: '/v1/subscriptions/current-payment-subscriptions'")
    expect(source).toContain("MY_PAYMENTS: '/v1/subscriptions/my-payments'")
    expect(source).toContain("RENEW_AUTO_RENEWAL: '/v1/subscriptions/renew-auto-renewal'")
  })

  it('keeps payment orchestration create -> redirect with baseline and pending markers', () => {
    const accountManagementSource = readSource(
      'src/features/subscriptions/hooks/useAccountManagement.ts'
    )

    expect(accountManagementSource).toContain(
      'const returnUrl = `${window.location.origin}${pathname}`'
    )
    expect(accountManagementSource).toContain('paymentBaseline.set(fresh.data?.data ?? [])')
    expect(accountManagementSource).toContain('const result = await createSubscription({')
    expect(accountManagementSource).toContain('paymentType,')
    expect(accountManagementSource).toContain('baseUrl: returnUrl,')
    expect(accountManagementSource).toContain('typeSubscription: typeDescription,')
    expect(accountManagementSource).toContain('paymentPending.set()')
    expect(accountManagementSource).toContain('window.location.href = result.url')
  })

  it('keeps payment return detector and query parser contract', () => {
    const returnFlowSource = readSource('src/features/subscriptions/hooks/usePaymentReturnFlow.ts')
    const returnQuerySource = readSource('src/features/subscriptions/lib/returnQuery.ts')

    expect(returnFlowSource).toContain('const returnStatus = parsePaymentReturn(searchParams)')
    expect(returnFlowSource).toContain('if (returnStatus !== null) {')
    expect(returnFlowSource).toContain('router.replace(pathname)')
    expect(returnFlowSource).toContain("if (returnStatus === 'failed' || !isPending) {")
    expect(returnFlowSource).toContain("setFlowStatus('failed')")
    expect(returnFlowSource).toContain('waitForSubscriptionUpdate(fetchSubscriptions, baseline)')

    expect(returnQuerySource).toContain("const success = searchParams.get('success')")
    expect(returnQuerySource).toContain("if (success === 'true')")
    expect(returnQuerySource).toContain("if (success === 'false')")
    expect(returnQuerySource).toContain("return 'success'")
    expect(returnQuerySource).toContain("return 'failed'")
  })

  it('keeps confirm/success/failure modal user contract and agree gate', () => {
    const messagesSource = readSource('messages/en.json')
    const confirmModalSource = readSource(
      'src/features/subscriptions/ui/PaymentModals/PaymentConfirmationModal.tsx'
    )
    const successModalSource = readSource(
      'src/features/subscriptions/ui/PaymentModals/PaymentSuccessModal.tsx'
    )
    const failureModalSource = readSource(
      'src/features/subscriptions/ui/PaymentModals/PaymentFailureModal.tsx'
    )

    expect(messagesSource).toContain(
      'Auto-renewal will be enabled with this payment. You can disable it anytime in your profile settings'
    )
    expect(messagesSource).toContain('Payment was successful!')
    expect(messagesSource).toContain('Transaction failed, please try again')

    expect(confirmModalSource).toContain("label={t('agree')}")
    expect(confirmModalSource).toContain('onCheckedChange={value => setIsAgreed(value === true)}')
    expect(confirmModalSource).toContain('disabled={!isAgreed || isSubmitting}')

    expect(successModalSource).toContain("modalTitle={t('successTitle')}")
    expect(failureModalSource).toContain("modalTitle={t('errorTitle')}")
    expect(failureModalSource).toContain('onClick={onBackToPayment}')
  })
})

describe('PAYMENTS-UC2-AUTO-RENEWAL-TOGGLE', () => {
  it('keeps auto-renew toggle wired to cancel/renew endpoints', () => {
    const source = readSource('src/features/subscriptions/hooks/useCurrentSubscriptionChain.ts')

    expect(source).toContain('const [cancelAutoRenewal, { isLoading: isCancelLoading }] =')
    expect(source).toContain('const [renewAutoRenewal, { isLoading: isRenewLoading }] =')
    expect(source).toContain('if (hasAutoRenewal) {')
    expect(source).toContain('await cancelAutoRenewal().unwrap()')
    expect(source).toContain('await renewAutoRenewal().unwrap()')
  })

  it('keeps auto-renew toggle lock conditions for queue integrity and empty state', () => {
    const source = readSource('src/features/subscriptions/hooks/useCurrentSubscriptionChain.ts')

    expect(source).toContain(
      'const hasQueueInvariantViolation = !isAutoRenewOnlyOnLastSubscription(subscriptions)'
    )
    expect(source).toContain('const isToggleDisabled =')
    expect(source).toContain('hasQueueInvariantViolation')
    expect(source).toContain('subscriptions.length === 0')
  })

  it('keeps Personal account type disabled while Business subscription is active', () => {
    const accountManagementSource = readSource(
      'src/features/subscriptions/ui/AccountManagement/AccountManagement.tsx'
    )
    const businessViewSource = readSource(
      'src/features/subscriptions/ui/BusinessSubscriptionView/BusinessSubscriptionView.tsx'
    )

    expect(accountManagementSource).toContain(
      'const hasActiveSubscription = subscriptionQueue.length > 0'
    )
    expect(accountManagementSource).toContain(
      "const accountType: AccountTypeValue = hasActiveSubscription ? 'business' : selectedAccountType"
    )
    expect(accountManagementSource).toContain("if (hasActiveSubscription && type === 'personal') {")
    expect(businessViewSource).toContain(
      "{ value: 'personal', label: 'Personal', disabled: hasActiveSubscription }"
    )
  })
})

describe('PAYMENTS-UC3-QUEUE-AND-TAIL-AUTORENEW', () => {
  it('keeps subscription queue sorting and last-item auto-renew invariant', () => {
    const accountManagementSource = readSource(
      'src/features/subscriptions/hooks/useAccountManagement.ts'
    )
    const chainSource = readSource(
      'src/features/subscriptions/hooks/useCurrentSubscriptionChain.ts'
    )
    const invariantSource = readSource(
      'src/features/subscriptions/model/isAutoRenewOnlyOnLastSubscription.ts'
    )

    expect(accountManagementSource).toContain(
      'const subscriptionQueue = [...subscriptionItems].sort('
    )
    expect(accountManagementSource).toContain(
      'new Date(a.endDateOfSubscription).getTime() - new Date(b.endDateOfSubscription).getTime()'
    )

    expect(chainSource).toContain('const tailIndex = subscriptions.length - 1')
    expect(chainSource).toContain('autoRenewal: index === tailIndex')
    expect(chainSource).toContain(
      'const leftEndTime = new Date(left.endDateOfSubscription).getTime()'
    )
    expect(chainSource).toContain('const leftPaymentTime = new Date(left.dateOfPayment).getTime()')

    expect(invariantSource).toContain('const lastIndex = subscriptions.length - 1')
    expect(invariantSource).toContain('return subscriptions.every(')
    expect(invariantSource).toContain(
      '(subscription, index) => !subscription.autoRenewal || index === lastIndex'
    )
  })
})

describe('PAYMENTS-UC4-MY-PAYMENTS-TABLE', () => {
  it('keeps my-payments API query defaults and sorting contract', () => {
    const source = readSource('src/features/subscriptions/api/subscriptionsApi.ts')

    expect(source).toContain('const DEFAULT_PAYMENTS_QUERY: Required<GetPaymentsRequestDto> = {')
    expect(source).toContain('pageNumber: DEFAULT_PAYMENTS_PAGE_NUMBER')
    expect(source).toContain('pageSize: DEFAULT_PAYMENTS_PAGE_SIZE')
    expect(source).toContain('sortBy: PaymentsSortBy.END_DATE')
    expect(source).toContain('sortDirection: PaymentsSortDirection.DESC')
    expect(source).toContain('url: API_ROUTES.SUBSCRIPTIONS.MY_PAYMENTS')
  })

  it('keeps payments table columns and sortable headers', () => {
    const source = readSource(
      'src/features/subscriptions/ui/Payments/PaymentsTable/PaymentsTable.tsx'
    )

    expect(source).toContain(
      "{ id: 'dateOfPayment', title: 'Date of payment', sortKey: PaymentsSortBy.DATE_OF_PAYMENT }"
    )
    expect(source).toContain(
      "{ id: 'endDate', title: 'End date', sortKey: PaymentsSortBy.END_DATE }"
    )
    expect(source).toContain("{ id: 'price', title: 'Price', sortKey: PaymentsSortBy.PRICE }")
    expect(source).toContain("{ id: 'subscriptionType', title: 'Subscription Type' }")
    expect(source).toContain(
      "{ id: 'paymentType', title: 'Payment Type', sortKey: PaymentsSortBy.PAYMENT_TYPE }"
    )
    expect(source).toContain('mapSubscriptionTypeToLabel(item.subscriptionType)')
    expect(source).toContain('mapPaymentTypeToLabel(item.paymentType)')
  })

  it('keeps page-size options and page reset logic on sort/page-size changes', () => {
    const hookSource = readSource('src/features/subscriptions/hooks/usePaymentsTable.ts')
    const constantsSource = readSource('src/features/subscriptions/model/payments.constants.ts')
    const paymentsSource = readSource('src/features/subscriptions/ui/Payments/Payments.tsx')

    expect(constantsSource).toContain('export const DEFAULT_PAYMENTS_PAGE_NUMBER = 1')
    expect(constantsSource).toContain('export const DEFAULT_PAYMENTS_PAGE_SIZE = 12')
    expect(constantsSource).toContain('export const PAYMENTS_PAGE_SIZE_OPTIONS = [8, 12, 16, 24]')

    expect(hookSource).toContain('setSort({ key, direction: PaymentsSortDirection.ASC })')
    expect(hookSource).toContain('setSort({ key, direction: PaymentsSortDirection.DESC })')
    expect(hookSource).toContain('setSort({ key: null, direction: null })')
    expect(hookSource).toContain('setPageNumber(DEFAULT_PAYMENTS_PAGE_NUMBER)')
    expect(hookSource).toContain('setPageSize(size)')

    expect(paymentsSource).toContain('pageSizeOptions={PAYMENTS_PAGE_SIZE_OPTIONS}')
  })
})
