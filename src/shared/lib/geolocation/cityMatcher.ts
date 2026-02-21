import { OptionType } from '@/shared/api/location'

export function findCityInAvailableList(
  cityName: string,
  cities: OptionType[],
  lang: 'en' | 'ru'
): OptionType | null {
  if (!cityName || !cities.length) {
    return null
  }

  const lowerCityName = cityName.toLowerCase()

  const exactMatch = cities.find(c => c.value.toLowerCase() === lowerCityName)

  if (exactMatch) {
    return exactMatch
  }

  const labelMatch = cities.find(
    c =>
      c.label.toLowerCase() === lowerCityName ||
      c.labels?.en?.toLowerCase() === lowerCityName ||
      c.labels?.ru?.toLowerCase() === lowerCityName
  )

  if (labelMatch) {
    return labelMatch
  }

  const partialMatch = cities.find(
    c =>
      lowerCityName.includes(c.value.toLowerCase()) ||
      c.value.toLowerCase().includes(lowerCityName) ||
      c.label.toLowerCase().includes(lowerCityName) ||
      lowerCityName.includes(c.label.toLowerCase())
  )

  return partialMatch || null
}
