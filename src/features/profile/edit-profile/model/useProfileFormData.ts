'use client'

import { useMemo } from 'react'

import { useProfile } from '@/entities/profile/lib'
import { useGetCountriesQuery } from '@/shared/api'
import { OptionType } from '@/shared/api/location'
import { buildCitiesMap, buildCountriesOptions } from '@/shared/lib'

interface UseProfileFormDataReturn {
  profile: ReturnType<typeof useProfile>['profile']
  countries: OptionType[]
  citiesMap: Record<string, OptionType[]>
  isLoadingCountries: boolean
  isLoadingProfile: boolean
  isReady: boolean
  updateProfile: ReturnType<typeof useProfile>['updateProfile']
  uploadAvatar: ReturnType<typeof useProfile>['uploadAvatar']
  removeAvatar: ReturnType<typeof useProfile>['removeAvatar']
  uploadAvatarState: ReturnType<typeof useProfile>['uploadAvatarState']
  deleteAvatarState: ReturnType<typeof useProfile>['deleteAvatarState']
}

/**
 * Хук для получения всех данных, необходимых для формы редактирования профиля
 *
 * Объединяет:
 * - Данные профиля (useProfile)
 * - Данные стран и городов (RTK Query)
 * - Трансформацию данных для UI
 *
 * @param lang - Язык интерфейса ('en' | 'ru')
 * @returns Объект с данными профиля, странами, городами и методами
 *
 * @example
 * const { profile, countries, citiesMap, isReady } = useProfileFormData('en')
 */
export function useProfileFormData(lang: 'en' | 'ru'): UseProfileFormDataReturn {
  const {
    profile,
    isProfileLoading: isLoadingProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    uploadAvatarState,
    deleteAvatarState,
  } = useProfile()

  const { data: rawCountries, isLoading: isLoadingCountries } = useGetCountriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  })

  // Трансформация данных стран и городов
  const { countries, citiesMap } = useMemo(() => {
    if (!rawCountries) {
      return { countries: [], citiesMap: {} }
    }

    return {
      countries: buildCountriesOptions(rawCountries, lang),
      citiesMap: buildCitiesMap(rawCountries, {}),
    }
  }, [rawCountries, lang])

  // Флаг готовности всех данных
  const isReady = !isLoadingProfile && !isLoadingCountries && !!profile && countries.length > 0

  return {
    profile,
    countries,
    citiesMap,
    isLoadingCountries,
    isLoadingProfile,
    isReady,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    uploadAvatarState,
    deleteAvatarState,
  }
}
