
import { GetCurrentSubscriptionResponseDto, GetPricingResponseDto } from '@/shared/types'

// ✅ Моковая активная подписка (Business)
export const mockActiveSubscription: GetCurrentSubscriptionResponseDto = {
    data: [
        {
            userId: 1,
            subscriptionId: 'sub_123',
            dateOfPayment: '2026-04-30T00:00:00.000Z',
            endDateOfSubscription: '2026-05-30T00:00:00.000Z',
            autoRenewal: true,
        },
    ],
    hasAutoRenewal: true,
}

// ✅ Моковая подписка без автопродления
export const mockSubscriptionNoAutoRenewal: GetCurrentSubscriptionResponseDto = {
    data: [
        {
            userId: 1,
            subscriptionId: 'sub_456',
            dateOfPayment: '2026-04-30T00:00:00.000Z',
            endDateOfSubscription: '2026-05-30T00:00:00.000Z',
            autoRenewal: false,
        },
    ],
    hasAutoRenewal: false,
}

// ✅ Моковые тарифы
export const mockPricing: GetPricingResponseDto = {
    data: [
        { amount: 9.99, typeDescription: 'DAY' },
        { amount: 49.99, typeDescription: 'WEEKLY' },
        { amount: 199.99, typeDescription: 'MONTHLY' },
    ],
}

// ✅ Хук для переключения моков (только для dev)
export const useMockSubscription = (enabled: boolean) => {
    if (!enabled) return null

    return {
        active: mockActiveSubscription,
        noAutoRenewal: mockSubscriptionNoAutoRenewal,
        pricing: mockPricing,
    }
}