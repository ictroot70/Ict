'use client'
import type { UseFormSetValue } from 'react-hook-form'

import { useCallback, useEffect, useRef, useState } from 'react'

import { EditProfileFormValues, useSyncLocation } from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api'
import {
  extractCityFromGeocodeResponse,
  extractCountryIso2FromGeocodeResponse,
} from '@/shared/api/location'
import {
  getCurrentPosition,
  getGeolocationErrorMessage,
  performReverseGeocode,
} from '@/shared/lib/geolocation'

interface PendingLocation {
  countryIso2: string
  cityName?: string
}

export type DetectLocationButtonText =
  | 'Detect my location'
  | 'Detecting...'
  | 'Location detected'
  | 'Failed to detect location'
  | 'Geolocation not supported'
  | 'Countries are still loading'
  | 'Geolocation permission denied'
  | 'Geolocation unavailable'
  | 'Geolocation timeout'

interface UseDetectLocationParams {
  setValue: UseFormSetValue<EditProfileFormValues>
  citiesMap: Record<string, OptionType[]>
  countries: OptionType[]
  lang: 'en' | 'ru'
}

/**
 * Hook to determine the user's location through the browser-based geolocation API
 * and synchronizing it with the profile editing form
 */
export function useDetectLocation({
  setValue,
  citiesMap,
  countries,
  lang,
}: UseDetectLocationParams) {
  const [buttonText, setButtonText] = useState<DetectLocationButtonText>('Detect my location')
  const [isDetecting, setIsDetecting] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(null)
  const lastAppliedLocationRef = useRef<string | null>(null)

  const { syncLocation } = useSyncLocation({
    setValue,
    citiesMap,
    countries,
    lang,
  })

  /**
   * Effect for applying delayed location
   * Starts when cities for a specific country are loaded
   */
  useEffect(() => {
    if (!pendingLocation) {
      return
    }
    if (countries.length === 0) {
      return
    }

    const { countryIso2, cityName } = pendingLocation

    if (!citiesMap[countryIso2]) {
      return
    }

    const applied = syncLocation(countryIso2, cityName)

    if (applied) {
      setButtonText('Location detected')
      setPendingLocation(null)
      lastAppliedLocationRef.current = `${countryIso2}-${cityName || ''}`
    }
  }, [pendingLocation, countries, citiesMap, syncLocation])

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setButtonText('Geolocation not supported')

      return
    }

    if (countries.length === 0) {
      setButtonText('Countries are still loading')

      return
    }

    setIsDetecting(true)
    setButtonText('Detecting...')

    let abortController: AbortController | null = null

    try {
      const position = await getCurrentPosition({ timeout: 10000 })
      const { latitude, longitude } = position.coords

      abortController = new AbortController()
      const fetchTimeout = setTimeout(() => abortController?.abort(), 8000)

      const geocodeData = await performReverseGeocode(latitude, longitude, lang)

      clearTimeout(fetchTimeout)

      if (!geocodeData?.address) {
        throw new Error('No address data received')
      }

      const countryIso2 = extractCountryIso2FromGeocodeResponse(geocodeData)
      const cityName = extractCityFromGeocodeResponse(geocodeData)

      if (!countryIso2) {
        throw new Error('Country not found in response')
      }

      const locationKey = `${countryIso2}-${cityName || ''}`

      if (lastAppliedLocationRef.current === locationKey) {
        setButtonText('Location detected')
        setIsDetecting(false)

        return
      }

      const applied = syncLocation(countryIso2, cityName)

      if (applied) {
        setButtonText('Location detected')
        lastAppliedLocationRef.current = locationKey
        setPendingLocation(null)
      } else {
        setPendingLocation({ countryIso2, cityName })
        setButtonText('Location detected')
      }
    } catch (error) {
      console.error('[useDetectLocation] Error:', error)
      const errorMessage = getGeolocationErrorMessage(error)

      setButtonText(errorMessage)
    } finally {
      setIsDetecting(false)
      if (abortController) {
        abortController.abort()
      }
    }
  }, [countries.length, lang, syncLocation])

  return {
    detectLocation,
    buttonText,
    isDetecting,
    hasPendingLocation: !!pendingLocation,
  }
}
