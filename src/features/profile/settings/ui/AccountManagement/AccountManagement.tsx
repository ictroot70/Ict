'use client';

import { useState } from 'react';
import styles from './AccountManagement.module.scss';
import { SubscriptionSection } from './SubscriptionSection/SubscriptionSection';
import { AccountTypeSection } from './AccountTypeSection/AccountTypeSection';
import { PlansSection } from './PlansSection/PlansSection';
import { AccountTypeValue } from '../../model/types';


export const AccountManagement: React.FC = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeValue>('personal');

  const accountTypes = [
    { value: 'personal' as AccountTypeValue, label: 'Personal' },
    { value: 'business' as AccountTypeValue, label: 'Business' }
  ];

  const handleAccountTypeChange = (type: AccountTypeValue) => {
    setSelectedAccountType(type);
  };

  return (
    <div className={styles.accountManagementPage}>
      <SubscriptionSection />

      <div className={styles.divider} />

      <AccountTypeSection
        accountTypes={accountTypes}
        selectedType={selectedAccountType}
        onTypeChange={handleAccountTypeChange}
      />

      {selectedAccountType === 'business' && (
        <>
          <div className={styles.divider} />
          <PlansSection />
        </>
      )}
    </div>
  );
};