/**
 * Client-side Location API (RTK Query)
 * !!! IMPORTANT: ONLY USED IN CLIENT COMPONENTS !!!
 */

import type { CountriesNowApiResponse, CitiesByCountryResponse } from './location.contracts'
import type { CountryWithCities } from './location.types'

import { baseApi } from '@/shared/api/base-api'

import { LOCATION_API_CONFIG } from './location.config'

export const locationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /**
     * Get a list of all countries with cities
     * Used in Client Components with RTK Query
     */
    getCountries: builder.query<CountryWithCities[], void>({
      query: () => ({
        url: LOCATION_API_CONFIG.COUNTRIES_API_URL,
        method: 'GET',
      }),
      transformResponse: (response: CountriesNowApiResponse) => {
        if (!response?.data || !Array.isArray(response.data)) {
          throw new Error('Invalid countries API response')
        }

        return response.data.map(c => ({
          country: c.country,
          country_ru: c.country,
          iso2: c.iso2,
          iso3: c.iso3,
          cities: c.cities,
          cities_ru: c.cities,
        }))
      },
      providesTags: ['Countries'],
      keepUnusedDataFor: 3600,
    }),

    /**
     * Get a list of cities in a specific country
     * Lazy loading - loaded only when you select a country
     */
    getCitiesByCountry: builder.query<string[], string>({
      query: countryIso2 => ({
        url: `${LOCATION_API_CONFIG.COUNTRIES_API_URL}/cities`,
        method: 'GET',
        params: { country: countryIso2 },
      }),
      transformResponse: (response: CitiesByCountryResponse) => {
        if (!response?.data || !Array.isArray(response.data)) {
          return []
        }

        return response.data
      },
      providesTags: (result, error, countryIso2) => [{ type: 'Cities', id: countryIso2 }],
      keepUnusedDataFor: 1800,
    }),
  }),
})

export const {
  useGetCountriesQuery,
  useLazyGetCountriesQuery,
  useGetCitiesByCountryQuery,
  useLazyGetCitiesByCountryQuery,
} = locationApi
