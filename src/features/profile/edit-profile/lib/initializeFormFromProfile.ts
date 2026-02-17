import type { EditProfileFormValues } from './editProfileFormValues'
import type { ProfileDto } from '@/entities/profile/api/dto'
import type { OptionType } from '@/shared/api/location'
import type { UseFormReset } from 'react-hook-form'

import { findCityOption, findCountryOption } from '@/features/profile/edit-profile/lib/formUtils'

interface InitializeFormParams {
  profile: ProfileDto
  countries: OptionType[]
  citiesMap: Record<string, OptionType[]>
  reset: UseFormReset<EditProfileFormValues>
}

function initializeLocationFields(
  profile: ProfileDto,
  countries: OptionType[],
  citiesMap: Record<string, OptionType[]>
): { country: string; city: string } {
  const location = { country: '', city: '' }

  if (!profile.country || countries.length === 0) {
    return location
  }

  const countryOption = findCountryOption(countries, profile.country)

  if (!countryOption) {
    return location
  }

  location.country = countryOption.value

  if (!profile.city) {
    return location
  }

  const cities = citiesMap[countryOption.value] || []

  if (cities.length === 0) {
    return location
  }

  const cityOption = findCityOption(cities, profile.city)

  if (cityOption) {
    location.city = cityOption.value
  }

  return location
}

export function initializeFormFromProfileData({
  profile,
  countries,
  citiesMap,
  reset,
}: InitializeFormParams): void {
  const location = initializeLocationFields(profile, countries, citiesMap)

  const defaultFormValues: EditProfileFormValues = {
    userName: profile.userName ?? '',
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    aboutMe: profile.aboutMe ?? '',
    country: location.country,
    city: location.city,
    region: profile.region ?? '',
    date_of_birth: (() => {
      if (!profile.dateOfBirth) return undefined
      const parsed = new Date(profile.dateOfBirth)
      return isNaN(parsed.getTime()) ? undefined : parsed
    })(),
    detectLocation: undefined,
  }

  reset(defaultFormValues)
}
