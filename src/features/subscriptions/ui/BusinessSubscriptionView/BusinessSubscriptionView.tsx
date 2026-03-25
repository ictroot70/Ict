// features/subscriptions/ui/BusinessSubscriptionView/BusinessSubscriptionView.tsx
import styles from './BusinessSubscriptionView.module.scss'
import { Subscription, SubscriptionPlan } from '../../model/types'
import { SubscriptionPricing } from '../SubscriptionPricing'
import { SubscriptionPlanValue } from '@/features/profile/settings/model/types'
import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection'

interface BusinessSubscriptionViewProps {
    /** Текущая активная подписка (если есть) */
    subscription?: Subscription
    /** Доступные тарифные планы */
    plans: SubscriptionPlan[]
    /** Выбранный тариф (контролируемое состояние) */
    selectedPlan?: SubscriptionPlanValue
    /** Callback при смене тарифа */
    onPlanChange?: (plan: SubscriptionPlanValue) => void
    /** Callback при клике на PayPal */
    onPayPalClick?: () => void
    /** Callback при клике на Stripe */
    onStripeClick?: () => void
    /** Блокирует кнопки оплаты */
    isPaymentLocked?: boolean
}

export const BusinessSubscriptionView: React.FC<BusinessSubscriptionViewProps> = ({
    subscription,
    plans,
    selectedPlan,
    onPlanChange,
    onPayPalClick,
    onStripeClick,
    isPaymentLocked = false
}) => {
    return (
        <div className={styles.container}>
            {/* 👇 Блок текущей подписки: даты + автопродление */}
            {subscription && <SubscriptionSection subscription={subscription} />}

            {/* 👇 Блок выбора нового тарифа и оплаты */}
            <SubscriptionPricing
                plans={plans}
                selectedPlan={selectedPlan}
                onPlanChange={onPlanChange}
                onPayPalClick={onPayPalClick}
                onStripeClick={onStripeClick}
                isPaymentLocked={isPaymentLocked}
            />
        </div>
    )
}