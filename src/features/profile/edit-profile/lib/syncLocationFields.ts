import { UseFormSetValue } from 'react-hook-form'

import { EditProfileFormValues } from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api/location'

interface SyncLocationFieldsParams {
  country: string
  currentCity?: string
  citiesMap: Record<string, OptionType[]>
  countries: OptionType[]
  setValue: UseFormSetValue<EditProfileFormValues>
  mode: 'manual' | 'detect'
  detectedCity?: string
  lang?: 'en' | 'ru'
}

export function syncLocationFields({
  country,
  currentCity,
  citiesMap,
  countries,
  setValue,
  mode,
  detectedCity,
  lang,
}: SyncLocationFieldsParams): void {
  const countryOption = countries.find(c => c.value === country)

  if (!countryOption) {
    console.error(`[syncLocationFields] Country "${country}" not found in countries list`)

    return
  }

  setValue('region', country, {
    shouldDirty: false,
    shouldValidate: false,
  })

  const cities = citiesMap[country] || []

  if (mode === 'manual') {
    if (currentCity) {
      const cityIsValid = cities.some(c => c.value === currentCity)

      if (!cityIsValid) {
        setValue('city', '', {
          shouldDirty: false,
          shouldValidate: true,
        })
      }
    }

    return
  }

  if (mode === 'detect' && detectedCity && lang) {
    const cityOption = cities.find(
      c =>
        c.value.toLowerCase() === detectedCity.toLowerCase() ||
        c.labels?.[lang]?.toLowerCase() === detectedCity.toLowerCase()
    )

    setValue('city', cityOption?.value || '', {
      shouldDirty: false,
      shouldValidate: true,
    })
  }
}
