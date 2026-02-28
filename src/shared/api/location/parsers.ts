import { ReverseGeocodeResponse } from '@/shared/api'

/**
 * Extracts the city name from the geocoding response
 * Priority: city > town > village > municipality > state_district > state
 */
export function extractCityFromGeocodeResponse(
  geocodeData: ReverseGeocodeResponse | null
): string | undefined {
  if (!geocodeData?.address) {
    return undefined
  }

  return (
    geocodeData.address.city ||
    geocodeData.address.town ||
    geocodeData.address.village ||
    geocodeData.address.municipality ||
    geocodeData.address.state_district ||
    geocodeData.address.state
  )
}

/**
 * Extracts the ISO2 country code from the geocoding response
 */
export function extractCountryIso2FromGeocodeResponse(
  geocodeData: ReverseGeocodeResponse | null
): string | null {
  if (!geocodeData?.address?.country_code) {
    return null
  }

  return geocodeData.address.country_code.toUpperCase()
}
