export interface CountriesNowApiResponse {
  error: boolean
  msg: string
  data: Array<{
    country: string
    iso2: string
    iso3: string
    cities: string[]
  }>
}

export interface CitiesByCountryResponse {
  error: boolean
  msg: string
  data: string[]
}
