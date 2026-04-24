'use client'

import { useEffect, useState } from 'react'

import { RussiaFlag, Select, UkFlag } from '@/shared/ui'

import styles from './LanguageSelect.module.scss'

export const LanguageSelect = () => {
  const [language, setLanguage] = useState<'en' | 'rus'>('en')
  const [isMounted, setIsMounted] = useState(false)

  // Todo: This is temporal version
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'rus' | null

    setLanguage(savedLang || 'en')
    setIsMounted(true)
  }, [])

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as 'en' | 'rus'

    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className={styles.languageSelect}>
      <Select
        defaultValue={language}
        value={language}
        placeholder={'Select...'}
        items={[
          { value: 'en', label: 'English', icon: <UkFlag /> },
          { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
        ]}
        // onValueChange={handleLanguageChange}
      />
    </div>
  )
}
