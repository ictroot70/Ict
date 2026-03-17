import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection';
import { SubscriptionPricing } from '../SubscriptionPricing';
import { Subscription, SubscriptionPlan } from '../../model/types';
import styles from './BusinessActiveSubscriptionView.module.scss';
import { SubscriptionType } from '@/shared/types';

interface Props {
  subscription: Subscription;
  plans: SubscriptionPlan[];
  selectedPlan?: SubscriptionType;           // ✅ слот для T2
  onPlanChange?: (plan: SubscriptionType) => void;  // ✅ слот для T2
  onStripeClick?: () => void;                // ✅ слот для T2
  onPaypalClick?: () => void;                // ✅ слот для T2
  isPaymentLocked?: boolean;                  // ✅ слот для T2
}

export const BusinessActiveSubscriptionView = ({ subscription, plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionSection subscription={subscription} />
    <div className={styles.divider} />
    <SubscriptionPricing plans={plans} />
  </div>
);