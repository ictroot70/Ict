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

  const { countries, citiesMap } = useMemo(() => {
    if (!rawCountries) {
      return { countries: [], citiesMap: {} }
    }

    return {
      countries: buildCountriesOptions(rawCountries, lang),
      citiesMap: buildCitiesMap(rawCountries, {}),
    }
  }, [rawCountries, lang])

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
