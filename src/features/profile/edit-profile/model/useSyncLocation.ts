import type { UseFormSetValue } from 'react-hook-form'

import { useCallback } from 'react'

import { EditProfileFormValues } from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api'
import { findCityInAvailableList } from '@/shared/lib'

interface UseSyncLocationParams {
  setValue: UseFormSetValue<EditProfileFormValues>
  citiesMap: Record<string, OptionType[]>
  countries: OptionType[]
  lang: 'en' | 'ru'
}

/**
 * Hook to sync a specific location with the form
 * Sets country, region, and city in the form
 */
export function useSyncLocation({ setValue, citiesMap, countries, lang }: UseSyncLocationParams) {
  const syncLocation = useCallback(
    (countryIso2: string, cityName?: string): boolean => {
      const countryOption = countries.find(c => c.value === countryIso2)

      if (!countryOption) {
        console.warn(`[syncLocation] Country "${countryIso2}" not found`)

        return false
      }

      const cities = citiesMap[countryIso2] || []

      if (cities.length === 0) {
        return false
      }

      setValue('country', countryIso2, {
        shouldDirty: true,
        shouldValidate: true,
      })

      setValue('region', countryIso2, {
        shouldDirty: false,
        shouldValidate: false,
      })

      if (cityName && cities.length > 0) {
        const cityOption = findCityInAvailableList(cityName, cities, lang)

        if (cityOption) {
          setTimeout(() => {
            setValue('city', cityOption.value, {
              shouldDirty: false,
              shouldValidate: true,
            })
          }, 1)

          return true
        } else {
          console.warn('[syncLocation] City not found in list:', cityName, 'available:', cities)
        }
      }

      setValue('city', '', {
        shouldDirty: false,
        shouldValidate: true,
      })

      return false
    },
    [setValue, citiesMap, countries, lang]
  )

  return { syncLocation }
}
