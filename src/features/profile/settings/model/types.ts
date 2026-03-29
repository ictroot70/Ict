// export type AccountTypeValue = 'personal' | 'business'
// export type SubscriptionPlanValue = '1day' | '7day' | 'month'

// export interface AccountTypeOption {
//   value: AccountTypeValue
//   label: string
// }

// export interface AccountTypeSectionProps {
//   accountTypes: AccountTypeOption[]
//   selectedType: AccountTypeValue
//   onTypeChange: (type: AccountTypeValue) => void
// }

// import type {
//   Subscription as SubSubscription,
//   SubscriptionPlan as SubSubscriptionPlan,
// } from '@/features/subscriptions/model/types'

// export interface UISubscription {
//   id: string
//   expireDate: string
//   nextPaymentDate: string
//   isActive: boolean
//   autoRenewal?: boolean
// }
// export interface UISubscriptionPlan {
//   value: SubscriptionPlanValue
//   label: string
//   price: string
//   period: string
// }

// export const mapSubscriptionToUI = (sub: SubSubscription): UISubscription => ({
//   id: sub.id,
//   expireDate: sub.expireDate,
//   nextPaymentDate: sub.nextPaymentDate,
//   isActive: sub.isActive,
//   autoRenewal: sub.autoRenewal,
// })

// export const mapPlanToUI = (plan: SubSubscriptionPlan): UISubscriptionPlan => ({
//   value: plan.value,
//   label: plan.label,
//   price: plan.price,
//   period: plan.period,
// })



// features/profile/settings/model/types.ts

export type AccountTypeValue = 'personal' | 'business'
export type SubscriptionPlanValue = '1day' | '7day' | 'month'

export interface AccountTypeOption {
  value: AccountTypeValue
  label: string
}

export interface AccountTypeSectionProps {
  accountTypes: AccountTypeOption[]
  selectedType: AccountTypeValue
  onTypeChange: (type: AccountTypeValue) => void
}

// ✅ Импортируем типы, которые УЖЕ преобразованы в subscriptions/model/types
import type {
  Subscription as SubSubscription,        // Уже имеет: id, expireDate, nextPaymentDate...
  SubscriptionPlan as SubSubscriptionPlan, // Уже имеет: value, label, price, period...
} from '@/features/subscriptions/model/types'

// ============================================
// UI типы для компонентов (почти идентичны импортированным)
// ============================================
export interface UISubscription {
  id: string
  expireDate: string
  nextPaymentDate: string
  isActive: boolean
  autoRenewal?: boolean  // ← Опциональное (разница с SubSubscription)
}

export interface UISubscriptionPlan {
  value: SubscriptionPlanValue
  label: string
  price: string
  period: string
  // id не нужен в UI, но можно добавить если требуется
}

// ============================================
// Мапперы — просто pass-through (поля уже совпадают!)
// ============================================

// Маппер подписки — поля уже в нужном формате
export const mapSubscriptionToUI = (sub: SubSubscription): UISubscription => ({
  id: sub.id,                    // ✅ sub.id уже есть
  expireDate: sub.expireDate,    // ✅ sub.expireDate уже есть
  nextPaymentDate: sub.nextPaymentDate, // ✅ уже есть
  isActive: sub.isActive,        // ✅ уже есть
  autoRenewal: sub.autoRenewal,  // ✅ boolean → boolean | undefined (совместимо)
})

// Маппер планов — поля уже в нужном формате
export const mapPlanToUI = (plan: SubSubscriptionPlan): UISubscriptionPlan => ({
  value: plan.value,    // ✅ уже SubscriptionPlanValue
  label: plan.label,    // ✅ уже есть
  price: plan.price,    // ✅ уже есть
  period: plan.period,  // ✅ уже string
})