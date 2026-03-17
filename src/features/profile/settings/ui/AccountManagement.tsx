'use client';

import { useState } from 'react';
import styles from './AccountManagement.module.scss';
import { useCurrentSubscription } from '@/features/subscriptions/model/hooks/useCurrentSubscription';
import { usePricing } from '@/features/subscriptions/model/hooks/usePricing';
import { resolveAccountManagementView } from '@/features/subscriptions/model/resolvers/accountManagementResolver';
import { BusinessNoSubscriptionView } from '@/features/subscriptions/ui/BusinessNoSubscriptionView/BusinessNoSubscriptionView';
import { BusinessActiveSubscriptionView } from '@/features/subscriptions/ui/BusinessActiveSubscriptionView/BusinessActiveSubscriptionView';
import { AccountTypeValue } from '../model/types';
import { SubscriptionSection } from './AccountManagement/SubscriptionSection/SubscriptionSection';
import { AccountTypeSection } from './AccountManagement/AccountTypeSection/AccountTypeSection';

export const AccountManagement = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal');
  const { subscriptions, isLoading: subLoading } = useCurrentSubscription();
  const { plans, isLoading: plansLoading } = usePricing();

  const view = resolveAccountManagementView({
    accountType: selectedAccountType,
    hasActiveSubscription: subscriptions.some(s => s.isActive)
  });

  const accountTypes = [
    { value: 'personal' as AccountTypeValue, label: 'Personal' },
    { value: 'business' as AccountTypeValue, label: 'Business' }
  ];

  if (subLoading || plansLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.accountManagementPage}>
      <SubscriptionSection subscription={subscriptions[0]} />

      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}
        onTypeChange={setSelectedAccountType}
      />

      {view === 'business-no-subscription' && (
        <>
          <BusinessNoSubscriptionView plans={plans} />
        </>
      )}

      {view === 'business-active-subscription' && subscriptions[0] && (
        <>
          <BusinessActiveSubscriptionView
            subscription={subscriptions[0]}
            plans={plans}
          />
        </>
      )}
    </div>
  );
};