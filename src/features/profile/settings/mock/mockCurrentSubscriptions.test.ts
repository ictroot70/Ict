// import {
//   mockCurrentSubscriptions,
//   mockSubscriptionCosts,
//   mockMyPayments,
// } from './mockCurrentSubscriptions'

// describe('Mock Data', () => {
//   describe('mockCurrentSubscriptions', () => {
//     it('should have correct structure', () => {
//       expect(mockCurrentSubscriptions).toHaveProperty('data')
//       expect(mockCurrentSubscriptions).toHaveProperty('hasAutoRenewal')
//       expect(Array.isArray(mockCurrentSubscriptions.data)).toBe(true)
//     })

//     it('should have 3 subscription items', () => {
//       expect(mockCurrentSubscriptions.data).toHaveLength(3)
//     })

//     it('each subscription should have required fields', () => {
//       mockCurrentSubscriptions.data.forEach(sub => {
//         expect(sub).toHaveProperty('userId')
//         expect(sub).toHaveProperty('subscriptionId')
//         expect(sub).toHaveProperty('dateOfPayment')
//         expect(sub).toHaveProperty('endDateOfSubscription')
//         expect(sub).toHaveProperty('autoRenewal')
//       })
//     })
//   })

//   describe('mockSubscriptionCosts', () => {
//     it('should have correct structure', () => {
//       expect(mockSubscriptionCosts).toHaveProperty('data')
//       expect(Array.isArray(mockSubscriptionCosts.data)).toBe(true)
//       expect(mockSubscriptionCosts.data).toHaveLength(3)
//     })

//     it('should have all plan types', () => {
//       const types = mockSubscriptionCosts.data.map(item => item.typeDescription)
//       expect(types).toContain('1DAY')
//       expect(types).toContain('7DAY')
//       expect(types).toContain('MONTHLY')
//     })

//     it('should have correct amounts', () => {
//       const amounts = mockSubscriptionCosts.data.map(item => item.amount)
//       expect(amounts).toContain(10)
//       expect(amounts).toContain(50)
//       expect(amounts).toContain(100)
//     })
//   })

//   describe('mockMyPayments', () => {
//     it('should have correct pagination structure', () => {
//       expect(mockMyPayments).toHaveProperty('totalCount', 3)
//       expect(mockMyPayments).toHaveProperty('pagesCount', 1)
//       expect(mockMyPayments).toHaveProperty('page', 1)
//       expect(mockMyPayments).toHaveProperty('pageSize', 10)
//       expect(mockMyPayments).toHaveProperty('items')
//       expect(Array.isArray(mockMyPayments.items)).toBe(true)
//     })

//     it('should have 3 payment items', () => {
//       expect(mockMyPayments.items).toHaveLength(3)
//     })

//     it('each payment should have required fields', () => {
//       mockMyPayments.items.forEach(payment => {
//         expect(payment).toHaveProperty('userId')
//         expect(payment).toHaveProperty('subscriptionId')
//         expect(payment).toHaveProperty('dateOfPayment')
//         expect(payment).toHaveProperty('endDateOfSubscription')
//         expect(payment).toHaveProperty('price')
//         expect(payment).toHaveProperty('subscriptionType')
//         expect(payment).toHaveProperty('paymentType')
//       })
//     })
//   })
// })
