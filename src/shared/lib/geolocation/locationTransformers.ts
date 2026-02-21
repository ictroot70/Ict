import type { CountryWithCities, OptionType } from '@/shared/api/location'

/**
 * Converts the list of countries to options for select
 * The result is sorted alphabetically
 *
 * @param data - An array of countries with cities
 * @param lang - Language for label
 * @returns An array of options for Select, sorted by label
 */
export function buildCountriesOptions(data: CountryWithCities[], lang: 'en' | 'ru'): OptionType[] {
  return data
    .map(c => ({
      value: c.iso2,
      label: lang === 'ru' ? c.country_ru : c.country,
      labels: {
        en: c.country,
        ru: c.country_ru,
      },
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Builds a map of cities by country
 *
 * @param data - An array of countries with cities
 * @param localizedCitiesMap - Map of localized city names
 *        Format: { [iso2]: { [cityName]: localizedName } }
 * @returns Object where the key is ISO2 country code, the value is an array of city options
 *
 * @example
 * - const citiesMap = buildCitiesMap(countries, {
 * -   'US': { 'New York': 'New York' },
 * -   'RU': { 'Moscow': 'Москва' }
 * - })
 *
 * - citiesMap['US'] // [{ value: 'New York', label: 'New York', ... }]
 */
export function buildCitiesMap(
  data: CountryWithCities[],
  localizedCitiesMap: Record<string, Record<string, string>>
): Record<string, OptionType[]> {
  return data.reduce<Record<string, OptionType[]>>((acc, country) => {
    acc[country.iso2] = country.cities.map(city => ({
      value: city,
      label: localizedCitiesMap[country.iso2]?.[city] ?? city,
      labels: {
        en: city,
        ru: localizedCitiesMap[country.iso2]?.[city] ?? city,
      },
    }))

    return acc
  }, {})
}
