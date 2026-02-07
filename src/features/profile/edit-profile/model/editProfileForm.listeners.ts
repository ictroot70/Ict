import type { ProfileDto } from '@/entities/profile/api/dto'

import { CountryWithCities, locationApi } from '@/shared/api/location'
import { buildCitiesMap, buildCountriesOptions } from '@/shared/lib'
import { createListenerMiddleware } from '@reduxjs/toolkit'

import { setCountriesData, setCountriesLoading } from './editProfileForm.slice'

export const editProfileFormListenerMiddleware = createListenerMiddleware()

function isProfileDto(payload: unknown): payload is ProfileDto {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    typeof (payload as { id: unknown }).id === 'number'
  )
}
editProfileFormListenerMiddleware.startListening({
  matcher: locationApi.endpoints.getCountries.matchPending,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(setCountriesLoading(true))
  },
})

editProfileFormListenerMiddleware.startListening({
  matcher: locationApi.endpoints.getCountries.matchFulfilled,
  effect: async (action, listenerApi) => {
    const rawCountries = action.payload as CountryWithCities[]

    const lang = 'en' // TODO: take from user settings

    const countries = buildCountriesOptions(rawCountries, lang)
    const citiesMap = buildCitiesMap(rawCountries, {})

    listenerApi.dispatch(setCountriesData({ countries, citiesMap }))
  },
})

editProfileFormListenerMiddleware.startListening({
  matcher: locationApi.endpoints.getCountries.matchRejected,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(setCountriesLoading(false))
  },
})
