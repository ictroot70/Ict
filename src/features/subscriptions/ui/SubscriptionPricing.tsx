'use client'

import { Card, Typography } from '@/shared/ui';
import styles from './SubscriptionPricing.module.scss';
import { SubscriptionPlan } from '../model/types';
import { useState } from 'react';

interface Props {
  plans: SubscriptionPlan[];
}

export function SubscriptionPricing({ plans }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]?.id || '');

  if (!plans.length) {
    return (
      <Card className={styles.stateCard}>
        <Typography variant="h3">No pricing plans</Typography>
        <Typography className={styles.stateText} variant="regular_16">
          Pricing is currently unavailable.
        </Typography>
      </Card>
    );
  }

  return (
    <section className={styles.section}>
      <Typography variant="h3" className={styles.section__title}>
        Change your subscription:
      </Typography>

      <div className={styles.pricingList}>
        <Card className={styles.pricingCard}>
          <div className={styles.pricingCard__content}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planRow} ${selectedPlan === plan.id ? styles.planRowSelected : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedPlan(plan.id);
                  }
                }}
              >
                <div className={styles.planRadio}>
                  <div className={`${styles.planRadio__circle} ${selectedPlan === plan.id ? styles.planRadio__circleSelected : ''}`}>
                    {selectedPlan === plan.id && <div className={styles.planRadio__dot} />}
                  </div>
                  <Typography variant="regular_16" className={styles.planRadio__label}>
                    {plan.label}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}