'use client';

import React, { useState } from 'react';
import styles from './AccountManagement.module.scss';
import { AccountTypeSection } from './AccountTypeSection/AccountTypeSection';
import { PlansSection } from './PlansSection/PlansSection';
import { SubscriptionSection } from './SubscriptionSection/SubscriptionSection';

// Типы
export type AccountTypeValue = 'personal' | 'business';
export type SubscriptionPlanValue = '1day' | '7day' | 'month';

export interface Subscription {
  id: number;
  expireDate: string;
  nextPaymentDate: string;
  isActive: boolean;
}

export interface SubscriptionPlan {
  value: SubscriptionPlanValue;
  label: string;
  price: string;
  period: string;
}

export const AccountManagement: React.FC = () => {
  // Состояния
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanValue>('month');

  // Данные для подписок
  const subscriptions: Subscription[] = [
    {
      id: 1,
      expireDate: '12.02.2022',
      nextPaymentDate: '13.02.2022',
      isActive: true
    },
    {
      id: 2,
      expireDate: '13.03.2022',
      nextPaymentDate: '14.03.2022',
      isActive: true
    },
    {
      id: 3,
      expireDate: '14.04.2022',
      nextPaymentDate: '15.04.2022',
      isActive: false
    }
  ];

  // Типы аккаунтов (без description)
  const accountTypes = [
    {
      value: 'personal' as AccountTypeValue,
      label: 'Personal'
    },
    {
      value: 'business' as AccountTypeValue,
      label: 'Business'
    }
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      value: '1day',
      label: '$10 per 1 Day',
      price: '$10',
      period: '1 Day'
    },
    {
      value: '7day',
      label: '$50 per 7 Day',
      price: '$50',
      period: '7 Days'
    },
    {
      value: 'month',
      label: '$100 per month',
      price: '$100',
      period: 'Month'
    }
  ];

  const handleAutoRenewalChange = () => {
    setAutoRenewal(prev => !prev);
  };

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    setSelectedAccountType(type);
    console.log('Account type changed to:', type);
  };

  const handlePlanChange = (plan: SubscriptionPlanValue) => {
    setSelectedPlan(plan);
    console.log('Subscription plan changed to:', plan);
  };

  return (
    <div className={styles.accountManagementPage}>
      <SubscriptionSection
        subscriptions={subscriptions}
        autoRenewal={autoRenewal}
        onAutoRenewalChange={handleAutoRenewalChange}
      />

      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}
        onTypeChange={handleAccountTypeChange}
      />

      {selectedAccountType === 'business' && (
        <PlansSection
          plans={subscriptionPlans}
          selectedPlan={selectedPlan}
          onPlanChange={handlePlanChange}
        />
      )}
    </div>
  );
};