import React, { useEffect, useState } from 'react';
import { Card, Typography, Button } from '@/shared/ui';
import { RadioGroupRadix } from '@ictroot/ui-kit';
import styles from './PlansSection.module.scss';
import { mockSubscriptionCosts } from '../../../mock/mockCurrentSubscriptions';
import { SubscriptionPlanValue, SubscriptionPlan } from '../../../model/types';

export const PlansSection: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'stripe' | null>(null);

  useEffect(() => {
    // Преобразуем данные из мока
    const formattedPlans = mockSubscriptionCosts.data.map((plan) => {
      let value: SubscriptionPlanValue = 'month';
      let label = '';

      switch (plan.typeDescription) {
        case '1DAY':
          value = '1day';
          label = `$${plan.amount} per 1 Day`;
          break;
        case '7DAY':
          value = '7day';
          label = `$${plan.amount} per 7 Days`;
          break;
        case 'MONTHLY':
          value = 'month';
          label = `$${plan.amount} per month`;
          break;
      }

      return {
        value,
        label,
        price: `$${plan.amount}`,
        period: plan.typeDescription
      };
    });

    setPlans(formattedPlans);
  }, []);

  const radioOptions = plans.map((plan) => ({
    value: plan.value,
    label: plan.label,
    id: `plan-${plan.value}`
  }));

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value as SubscriptionPlanValue);
    console.log('Subscription plan changed to:', value);
  };

  const handlePayPalClick = () => {
    setPaymentMethod('paypal');
    console.log('Processing payment with PayPal for plan:', selectedPlan);
    // Здесь будет вызов API для оплаты через PayPal
  };

  const handleStripeClick = () => {
    setPaymentMethod('stripe');
    console.log('Processing payment with Stripe for plan:', selectedPlan);
    // Здесь будет вызов API для оплаты через Stripe
  };

  // Находим выбранный план для отображения цены
  const selectedPlanData = plans.find(p => p.value === selectedPlan);

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
              onValueChange={handlePlanChange}
              options={radioOptions}
              orientation="vertical"
            />
          </div>
        </Card>
      </div>

      <div className={styles.paymentContainer}>
        <Typography variant="regular_14" className={styles.paymentLabel}>
          Select payment method:
        </Typography>

        <div className={styles.paymentButtons}>
          <Button
            className={`${styles.paymentButton} ${paymentMethod === 'paypal' ? styles.paymentButtonActive : ''}`}
            onClick={handlePayPalClick}
            variant="outline"
          >
            <span className={styles.paymentButtonContent}>
              <svg className={styles.paypalIcon} viewBox="0 0 24 24" width="20" height="20">
                <path fill="#003087" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.633h5.61c3.427 0 5.44 1.58 5.886 4.638.06.403.088.82.088 1.247 0 3.13-1.92 5.274-5.526 5.274h-1.65a.64.64 0 0 0-.633.55l-.742 4.714a.64.64 0 0 1-.633.55z" />
                <path fill="#009cde" d="M19.077 8.215c-.132.806-.414 1.49-.83 2.06-.79 1.08-2.124 1.77-3.818 1.77h-1.84a.38.38 0 0 0-.377.32l-.97 6.14-.277 1.72a.45.45 0 0 0 .444.52h3.42a.56.56 0 0 0 .556-.48l1.13-7.14h1.17c3.18 0 5.48-1.48 6.02-4.33.26-1.35.07-2.53-.66-3.3-.3-.32-.68-.56-1.12-.72-.2-.07-.43-.12-.68-.16-.25-.04-.52-.06-.82-.06h-1.63c-.3 0-.58.14-.77.38-.18.24-.26.55-.22.86z" />
              </svg>
              PayPal
            </span>
          </Button>

          <Typography variant="regular_14" className={styles.paymentOr}>
            or
          </Typography>

          <Button
            className={`${styles.paymentButton} ${paymentMethod === 'stripe' ? styles.paymentButtonActive : ''}`}
            onClick={handleStripeClick}
            variant="outline"
          >
            <span className={styles.paymentButtonContent}>
              <svg className={styles.stripeIcon} viewBox="0 0 24 24" width="20" height="20">
                <path fill="#635BFF" d="M13.97 4.58c-2.71 0-4.96 1.86-4.96 4.94 0 3.08 2.25 4.94 4.96 4.94 2.71 0 4.96-1.86 4.96-4.94 0-3.08-2.25-4.94-4.96-4.94zm0 7.68c-1.26 0-2.18-1.06-2.18-2.74 0-1.68.92-2.74 2.18-2.74 1.26 0 2.18 1.06 2.18 2.74 0 1.68-.92 2.74-2.18 2.74zM8.7 9.32H6.56c-.31 0-.5.19-.5.5v7.08c0 .31.19.5.5.5h2.14c.31 0 .5-.19.5-.5V9.82c0-.31-.19-.5-.5-.5zm10.74 0h-2.14c-.31 0-.5.19-.5.5v7.08c0 .31.19.5.5.5h2.14c.31 0 .5-.19.5-.5V9.82c0-.31-.19-.5-.5-.5zM5.5 9.32H3.36c-.31 0-.5.19-.5.5v7.08c0 .31.19.5.5.5H5.5c.31 0 .5-.19.5-.5V9.82c0-.31-.19-.5-.5-.5z" />
              </svg>
              Stripe
            </span>
          </Button>
        </div>

        {paymentMethod && selectedPlanData && (
          <div className={styles.paymentSummary}>
            <Typography variant="regular_14" className={styles.paymentSummaryText}>
              You selected: <strong>{selectedPlanData.label}</strong> via <strong>{paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}</strong>
            </Typography>
            <Button className={styles.confirmButton} variant="primary">
              Confirm Payment
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};