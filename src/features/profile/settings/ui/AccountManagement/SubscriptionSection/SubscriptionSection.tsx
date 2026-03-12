import React from 'react';
import { Card, CheckboxRadix, Typography, } from '@/shared/ui';
import styles from './SubscriptionSection.module.scss';
import { Subscription } from '../../../model/types';

interface SubscriptionSectionProps {
  subscriptions: Subscription[];
  autoRenewal: boolean;
  onAutoRenewalChange: () => void;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  subscriptions,
  autoRenewal,
  onAutoRenewalChange
}) => {
  return (
    <section className={styles.section}>
      <Typography variant="h3" className={styles.section__title}>
        Current Subscription:
      </Typography>

      <div className={styles.subscriptionsList}>
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className={`${styles.subscriptionCard}`}
          >
            <div className={styles.subscriptionCard__fields}>
              <div className={styles.subscriptionField}>
                <Typography variant="regular_14" className={styles.subscriptionField__label}>
                  Expire at
                </Typography>
                <Typography variant="bold_14" className={styles.subscriptionField__date}>
                  {subscription.expireDate}
                </Typography>
              </div>

              <div className={styles.subscriptionField}>
                <Typography variant="regular_14" className={styles.subscriptionField__label}>
                  Next payment
                </Typography>
                <Typography variant="bold_14" className={styles.subscriptionField__date}>
                  {subscription.nextPaymentDate}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.autoRenewalContainer}>
        <CheckboxRadix
          checked={autoRenewal}
          onCheckedChange={onAutoRenewalChange}
          label="Auto-Renewal"
        />
      </div>
    </section>
  );
};