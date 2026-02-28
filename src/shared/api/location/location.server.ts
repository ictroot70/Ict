import type { CountriesNowApiResponse } from './location.contracts'
import type { CountryWithCities, ReverseGeocodeResponse } from './location.types'

import { LOCATION_API_CONFIG } from './location.config'

/**
 * Download countries with cities for Server Components
 *
 * @example
 * // Server Component:
 * async function EditProfilePage() {
 *   const countries = await fetchCountriesWithCities()
 *   return <EditProfileForm initialCountries={countries} />
 * }
 */
export async function fetchCountriesWithCities(): Promise<CountryWithCities[]> {
  const res = await fetch(LOCATION_API_CONFIG.COUNTRIES_API_URL, {
    next: { revalidate: 3600 }, // Next.js cache for 1 hour
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.status}`)
  }

  const json: CountriesNowApiResponse = await res.json()

  if (!json?.data || !Array.isArray(json.data)) {
    console.error('Invalid countries response', json)
    throw new Error('Invalid response format from countries API')
  }

  return json.data.map(c => ({
    country: c.country,
    country_ru: c.country,
    iso2: c.iso2,
    iso3: c.iso3,
    cities: c.cities,
    cities_ru: c.cities,
  }))
}

/**
 * Reverse geocoding через Nominatim OpenStreetMap API
 *Determines the address by coordinates
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param lang - Response language
 * @param options - Additional fetch parameters
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  lang: 'en' | 'ru' = 'en',
  options?: globalThis.RequestInit
): Promise<ReverseGeocodeResponse> {
  const url = `${LOCATION_API_CONFIG.NOMINATIM_API_URL}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': LOCATION_API_CONFIG.NOMINATIM_USER_AGENT,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`)
  }

  return res.json()
}
