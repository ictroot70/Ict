import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection';
import { SubscriptionPricing } from '../SubscriptionPricing';
import { Subscription, SubscriptionPlan } from '../../model/types';
import styles from './BusinessActiveSubscriptionView.module.scss';

interface Props {
  subscription: Subscription;
  plans: SubscriptionPlan[];
}

export const BusinessActiveSubscriptionView = ({ subscription, plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionSection subscription={subscription} />
    <div className={styles.divider} />
    <SubscriptionPricing plans={plans} />
  </div>
);