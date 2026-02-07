import { EditProfileFormValues } from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api'

interface PrepareProfileUpdatePayloadParams {
  data: EditProfileFormValues
  dirtyFields: Record<string, boolean>
  citiesMap: Record<string, OptionType[]>
}

export function prepareProfileUpdatePayload({
  data,
  dirtyFields,
  citiesMap,
}: PrepareProfileUpdatePayloadParams): {
  userName: string
  firstName: string
  lastName: string
  aboutMe?: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string
} {
  let dateOfBirth: string | undefined = undefined

  if (data.date_of_birth) {
    dateOfBirth = data.date_of_birth.toISOString()
  }

  const payload = {
    userName: data.userName,
    firstName: data.firstName,
    lastName: data.lastName,
    aboutMe: data.aboutMe,
    city: data.city,
    country: data.country,
    region: data.region,
    dateOfBirth,
  }

  const currentCountry = data.country
  const currentCity = data.city

  if (currentCountry && currentCity) {
    const cities = citiesMap[currentCountry] || []
    const cityIsValid = cities.some((c: OptionType) => c.value === currentCity)

    if (!cityIsValid) {
      payload.city = undefined
    }
  }

  if (dirtyFields.country && data.country) {
    const cities = citiesMap[data.country] || []

    if (currentCity && !cities.some((c: OptionType) => c.value === currentCity)) {
      payload.city = undefined
    }
  }

  return payload
}
