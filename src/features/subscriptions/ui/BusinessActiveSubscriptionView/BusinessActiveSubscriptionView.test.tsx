// /* @vitest-environment jsdom */
// import React from 'react'

// import { render, screen, fireEvent } from '@testing-library/react'
// import { describe, expect, it, vi, beforeEach } from 'vitest'

// // ─── Мок react-i18next ─────────────────────────────────────
// vi.mock('react-i18next', () => ({
//   useTranslation: () => ({
//     t: (key: string) =>
//       ({
//         'account.personal': 'Personal',
//         'account.business': 'Business',
//         'subscription.active.title': 'Your subscription',
//         'subscription.pricing.title': 'Change your su bscription',
//         'subscription.pricing.monthly': 'Monthly',
//         'subscription.pricing.yearly': 'Yearly',
//         'subscription.pricing.paypal': 'Pay with PayPal',
//         'subscription.pricing.stripe': 'Pay with Stripe',
//         'subscription.pricing.noPlans': 'No plans available',
//         'personal.title': 'Personal Account',
//         'personal.description': 'You are currently using a free Personal account',
//       })[key] ?? key,
//   }),
// }))

// // ─── Мок UI-компонентов (@/shared/ui или @/ictroot/ui-kit) ─
// vi.mock('@/shared/ui', () => ({
//   Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
//     <div className={className} data-testid={'card'}>
//       {children}
//     </div>
//   ),
//   Typography: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
//     <span data-variant={variant}>{children}</span>
//   ),
//   Button: ({
//     children,
//     onClick,
//     disabled,
//     variant,
//     className,
//   }: {
//     children: React.ReactNode
//     onClick?: () => void
//     disabled?: boolean
//     variant?: string
//     className?: string
//   }) => (
//     <button
//       data-testid={'button'}
//       data-variant={variant}
//       className={className}
//       disabled={disabled}
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   ),
// }))

// // ─── Мок дочерних компонентов ──────────────────────────────
// vi.mock(
//   '@/features/profile/settings/ui/AccountManagement/AccountTypeSection/AccountTypeSection',
//   () => ({
//     AccountTypeSection: ({
//       accountTypes,
//       selectedType,
//       onTypeChange,
//     }: {
//       accountTypes: { value: string; label: string }[]
//       selectedType: string
//       onTypeChange: (value: string) => void
//     }) => (
//       <div data-testid={'account-type-section'}>
//         {accountTypes.map(type => (
//           <label key={type.value}>
//             <input
//               type={'radio'}
//               name={'accountType'}
//               value={type.value}
//               checked={selectedType === type.value}
//               onChange={() => onTypeChange(type.value)}
//               aria-label={type.label}
//             />
//             {type.label}
//           </label>
//         ))}
//       </div>
//     ),
//   })
// )

// vi.mock(
//   '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection',
//   () => ({
//     SubscriptionSection: ({ subscription }: { subscription: any }) => (
//       <div data-testid={'subscription-section'}>
//         <span data-testid={'subscription-status'}>{subscription.status}</span>
//         <span data-testid={'subscription-plan'}>{subscription.plan}</span>
//       </div>
//     ),
//   })
// )
