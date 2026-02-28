export {
  useGetCountriesQuery,
  useLazyGetCountriesQuery,
  useGetCitiesByCountryQuery,
  useLazyGetCitiesByCountryQuery,
  locationApi,
} from './location.api'

export { fetchCountriesWithCities, reverseGeocode } from './location.server'

export type {
  OptionType,
  CountryWithCities,
  NominatimAddress,
  ReverseGeocodeResponse,
} from './location.types'

export type { CountriesNowApiResponse, CitiesByCountryResponse } from './location.contracts'

export { LOCATION_API_CONFIG } from './location.config'
export { extractCityFromGeocodeResponse, extractCountryIso2FromGeocodeResponse } from './parsers'
