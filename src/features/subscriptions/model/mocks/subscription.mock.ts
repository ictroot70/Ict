import { GetCurrentSubscriptionResponseDto } from '@/shared/types'

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
