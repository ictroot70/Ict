import { SubscriptionPricing } from '../SubscriptionPricing';
import { SubscriptionPlan } from '../../model/types';
import styles from './BusinessNoSubscriptionView.module.scss';

interface Props {
  plans: SubscriptionPlan[];
}

export const BusinessNoSubscriptionView = ({ plans }: Props) => (
  <div className={styles.container}>
    <SubscriptionPricing plans={plans} />
  </div>
);