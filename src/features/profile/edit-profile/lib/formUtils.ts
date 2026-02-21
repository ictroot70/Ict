import type { OptionType } from '@/shared/api/location'

const normalizeString = (str: string = ''): string => {
  return str
    .toLowerCase()
    .trim()
    .replaceAll(/[-_()]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
}

export const findCountryOption = (
  countries: OptionType[],
  countryName: string
): OptionType | undefined => {
  if (!countryName) {
    return undefined
  }

  const normalizedSearch = normalizeString(countryName)

  return countries.find((countryOptionItem: OptionType) => {
    if (normalizeString(countryOptionItem.value) === normalizedSearch) {
      return true
    }

    if (normalizeString(countryOptionItem.label) === normalizedSearch) {
      return true
    }

    if (countryOptionItem.labels) {
      if (normalizeString(countryOptionItem.labels.en) === normalizedSearch) {
        return true
      }

      if (normalizeString(countryOptionItem.labels.ru) === normalizedSearch) {
        return true
      }
    }

    return false
  })
}

export const findCityOption = (cities: OptionType[], cityName: string): OptionType | undefined => {
  if (!cityName) {
    return undefined
  }

  const normalizedSearch = normalizeString(cityName)

  return cities.find((cityItem: OptionType) => {
    if (normalizeString(cityItem.value) === normalizedSearch) {
      return true
    }

    if (normalizeString(cityItem.label) === normalizedSearch) {
      return true
    }

    if (cityItem.labels) {
      if (normalizeString(cityItem.labels.en) === normalizedSearch) {
        return true
      }

      if (normalizeString(cityItem.labels.ru) === normalizedSearch) {
        return true
      }
    }

    return false
  })
}
