export type OptionType = {
  value: string
  label: string
  labels?: {
    en?: string
    ru?: string
  }
  iso2?: string
}

export type CountryWithCities = {
  country: string
  country_ru: string
  iso2: string
  iso3: string
  cities: string[]
  cities_ru: string[]
}

/**
 * Types for Nominatim OpenStreetMap Reverse Geocoding API
 * Documentation: https://nominatim.org/release-docs/latest/api/Reverse/
 */

export interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  state?: string
  state_district?: string
  county?: string
  region?: string
  country?: string
  country_code?: string
  suburb?: string
  neighbourhood?: string
  road?: string
  house_number?: string
  postcode?: string
  [key: string]: string | undefined
}

export interface ReverseGeocodeResponse {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  display_name: string
  address: NominatimAddress
  boundingbox: string[]
}
