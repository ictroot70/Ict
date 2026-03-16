// 'use client'

// import { useEffect, useState } from 'react'

// import { RussiaFlag, Select, UkFlag } from '@/shared/ui'

// import styles from './LanguageSelect.module.scss'

// export const LanguageSelect = () => {
//   const [language, setLanguage] = useState<'en' | 'rus'>('en')

//   useEffect(() => {
//     const savedLang = localStorage.getItem('language') as 'en' | 'rus' | null

//     if (savedLang) {
//       setLanguage(savedLang)
//     }
//   }, [])

//   const handleLanguageChange = (value: string) => {
//     const newLanguage = value as 'en' | 'rus'

//     setLanguage(newLanguage)
//     localStorage.setItem('language', newLanguage)
//   }

//   return (
//     <div className={styles.languageSelect}>
//       <Select
//         defaultValue={language}
//         value={language}
//         placeholder={'Select...'}
//         items={[
//           { value: 'en', label: 'English', icon: <UkFlag /> },
//           { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
//         ]}
//         // onValueChange={handleLanguageChange}
//       />
//     </div>
//   )
// }


import React from 'react';
import { Select } from '@/shared/ui';

const UkFlag = () => <span>🇬🇧</span>;
const RussiaFlag = () => <span>🇷🇺</span>;

export const LanguageSelect = () => {
  return (
    <Select
      placeholder={'Select...'}
      items={[
        { value: 'en', label: 'English', icon: <UkFlag /> },
        { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
      ]}
    />
  );
};