'use client'

import { useEffect, useState } from 'react'
import { UseFormReset } from 'react-hook-form'

import { ProfileDto } from '@/entities/profile/api/dto'
import { OptionType } from '@/shared/api/location'
import { logger } from '@/shared/lib/logger'

import { EditProfileFormValues } from '../lib/editProfileFormValues'
import { initializeFormFromProfileData } from '../lib/initializeFormFromProfile'

interface UseProfileFormInitializationParams {
  profile: ProfileDto | undefined
  countries: OptionType[]
  citiesMap: Record<string, OptionType[]>
  reset: UseFormReset<EditProfileFormValues>
}

interface UseProfileFormInitializationReturn {
  isInitialized: boolean
}

/**
 * Хук для инициализации формы профиля данными из API
 *
 * Управляет процессом заполнения формы:
 * - Ждёт загрузки профиля и стран
 * - Инициализирует форму один раз
 * - Предотвращает повторную инициализацию
 *
 * @param params - Параметры инициализации
 * @param params.profile - Данные профиля пользователя
 * @param params.countries - Список стран для формы
 * @param params.citiesMap - Карта городов по странам
 * @param params.reset - Функция reset из React Hook Form
 *
 * @returns Объект с флагом isInitialized
 *
 * @example
 * const { isInitialized } = useProfileFormInitialization({
 *   profile,
 *   countries,
 *   citiesMap,
 *   reset: form.reset,
 * })
 */
export function useProfileFormInitialization({
  profile,
  countries,
  citiesMap,
  reset,
}: UseProfileFormInitializationParams): UseProfileFormInitializationReturn {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (isInitialized) {
      logger.debug('Form already initialized, skipping')

      return
    }

    // Ждём загрузки всех необходимых данных
    if (!profile) {
      logger.debug('Waiting for profile data')

      return
    }

    if (countries.length === 0) {
      logger.debug('Waiting for countries data')

      return
    }

    // Инициализируем форму
    logger.debug('Initializing form with profile data', {
      userName: profile.userName,
      countriesCount: countries.length,
      citiesCount: Object.keys(citiesMap).length,
    })

    initializeFormFromProfileData({
      profile,
      countries,
      citiesMap,
      reset,
    })

    setIsInitialized(true)
    logger.debug('Form initialization completed')
  }, [profile, countries, citiesMap, reset, isInitialized])

  return { isInitialized }
}
