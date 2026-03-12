'use client';

import React from 'react';
import styles from './AccountSettings.module.scss';
import { AccountManagement } from './AccountManagement/AccountManagement';
import { AccountType } from './AccountManagement/AccountTypeSection/AccountType';

export const SettingsPage: React.FC = () => {
  const handleAccountTypeChange = (type: 'personal' | 'business') => {
    console.log('Account type changed to:', type);
    // Здесь можно отправить запрос на сервер или обновить состояние
  };

  return (
    <div className={styles.settingsPage}>
      <AccountManagement />
      <div className={styles.divider} />

      <AccountType
        initialValue="personal"
        onTypeChange={handleAccountTypeChange}
        showInfo={true}
      />
    </div>
  );
};