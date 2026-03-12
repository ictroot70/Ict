import React from 'react';
import { Card, Typography } from '@/shared/ui';
import { RadioGroupRadix } from '@ictroot/ui-kit';
import styles from './PlansSection.module.scss';
import { SubscriptionPlan, SubscriptionPlanValue } from '../../../model/types';

interface PlansSectionProps {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlanValue;
  onPlanChange: (plan: SubscriptionPlanValue) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  plans,
  selectedPlan,
  onPlanChange
}) => {
  const radioOptions = plans.map((plan) => ({
    value: plan.value,
    label: plan.label,
    id: `plan-${plan.value}`
  }));

  return (
    <section className={styles.section}>
      <Typography variant="h3" className={styles.section__title}>
        Change your subscription:
      </Typography>

      <div className={styles.plansList}>
        <Card className={styles.plansCard}>
          <div className={styles.plansCard__content}>
            <RadioGroupRadix
              label="Subscription plan"
              value={selectedPlan}
              onValueChange={(value) => onPlanChange(value as SubscriptionPlanValue)}
              options={radioOptions}
              orientation="vertical"
            />
          </div>
        </Card>
      </div>
    </section>
  );
};