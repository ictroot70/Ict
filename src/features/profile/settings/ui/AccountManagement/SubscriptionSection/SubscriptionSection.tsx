import React, { useEffect, useState } from 'react';
import { Card, CheckboxRadix, Typography } from '@/shared/ui';
import styles from './SubscriptionSection.module.scss';
import { mockCurrentSubscriptions } from '../../../mock/mockCurrentSubscriptions';
import { Subscription } from '../../../model/types';


export const SubscriptionSection: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);

  useEffect(() => {
    // Форматируем даты из мок данных
    const formattedSubs = mockCurrentSubscriptions.data.map((sub) => {
      const dateOfPayment = new Date(sub.dateOfPayment);
      const endDate = new Date(sub.endDateOfSubscription);
      const today = new Date();

      return {
        id: sub.subscriptionId,
        expireDate: dateOfPayment.toLocaleDateString('ru-RU'), // -> 12.02.2022
        nextPaymentDate: endDate.toLocaleDateString('ru-RU'), // -> 13.03.2022
        isActive: endDate > today
      };
    });

    setSubscriptions(formattedSubs);
    setAutoRenewal(mockCurrentSubscriptions.hasAutoRenewal);
  }, []);

  const handleAutoRenewalChange = (checked: boolean) => {
    setAutoRenewal(checked);
    console.log('Auto renewal changed to:', checked);
    // Здесь будет вызов API для отмены/возобновления
  };

  return (
    <section className={styles.section}>
      <Typography variant="h3" className={styles.section__title}>
        Current Subscription:
      </Typography>

      <div className={styles.subscriptionsList}>
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className={`${styles.subscriptionCard} ${!subscription.isActive ? styles.subscriptionCardInactive : ''
              }`}
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
          onCheckedChange={handleAutoRenewalChange}
          label="Auto-Renewal"
        />
      </div>
    </section>
  );
};