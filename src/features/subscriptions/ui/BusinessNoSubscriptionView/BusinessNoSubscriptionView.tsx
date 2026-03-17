import { SubscriptionPricing } from '../SubscriptionPricing';
import { SubscriptionPlan } from '../../model/types';
import styles from './BusinessNoSubscriptionView.module.scss';
import { SubscriptionType } from '@/shared/types';

interface Props {
  plans: SubscriptionPlan[];
  selectedPlan?: SubscriptionType;           // ✅ слот для T2
  onPlanChange?: (plan: SubscriptionType) => void;  // ✅ слот для T2
}
export const BusinessNoSubscriptionView = ({ plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionPricing plans={plans} />
  </div>
);