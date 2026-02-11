'use client'

import { useMemo } from 'react'

import { useProfileManagement } from '@/features/profile/edit-profile'
import { useGetCountriesQuery } from '@/shared/api'
import { OptionType } from '@/shared/api/location'
import { buildCitiesMap, buildCountriesOptions } from '@/shared/lib'

interface UseProfileFormDataReturn {
  profile: ReturnType<typeof useProfileManagement>['profile']
  countries: OptionType[]
  citiesMap: Record<string, OptionType[]>
  isLoadingCountries: boolean
  isLoadingProfile: boolean
  isReady: boolean
  updateProfile: ReturnType<typeof useProfileManagement>['updateProfile']
  uploadAvatar: ReturnType<typeof useProfileManagement>['uploadAvatar']
  removeAvatar: ReturnType<typeof useProfileManagement>['removeAvatar']
  uploadAvatarState: ReturnType<typeof useProfileManagement>['uploadAvatarState']
  deleteAvatarState: ReturnType<typeof useProfileManagement>['deleteAvatarState']
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
  } = useProfileManagement()

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
