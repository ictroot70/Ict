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
  dateOfBirth: string | null
} {
  const dateOfBirth: string | null =
    data.date_of_birth instanceof Date && !isNaN(data.date_of_birth.getTime())
      ? data.date_of_birth.toISOString()
      : null

  const strOrUndefined = (val: string | undefined): string | undefined =>
    val && val.trim().length > 0 ? val : undefined

  const payload: {
    userName: string
    firstName: string
    lastName: string
    aboutMe?: string
    city?: string
    country?: string
    region?: string
    dateOfBirth: string | null
  } = {
    userName: data.userName,
    firstName: data.firstName,
    lastName: data.lastName,
    ...(strOrUndefined(data.aboutMe) !== undefined && { aboutMe: strOrUndefined(data.aboutMe) }),
    ...(strOrUndefined(data.city) !== undefined && { city: strOrUndefined(data.city) }),
    ...(strOrUndefined(data.country) !== undefined && { country: strOrUndefined(data.country) }),
    ...(strOrUndefined(data.region) !== undefined && { region: strOrUndefined(data.region) }),
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
