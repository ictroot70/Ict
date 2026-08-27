import { reverseGeocode, ReverseGeocodeResponse } from '@/shared/api'

/**
 * Performs reverse geocoding with logging for debugging
 */
export async function performReverseGeocode(
  latitude: number,
  longitude: number,
  lang: 'en' | 'ru'
): Promise<ReverseGeocodeResponse> {
  try {
    const data = await reverseGeocode(latitude, longitude, lang)

    return data
  } catch (error) {
    console.error('[reverseGeocode] Error:', error)
    throw error
  }
}
