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

/**
 * Converts geolocation error into a clear text message
 */
export function getGeolocationErrorMessage(error: unknown): DetectLocationButtonText {
  if (!(error instanceof Error)) {
    return 'Failed to detect location'
  }

  if (error.message.includes('timeout') || error.name === 'AbortError') {
    return 'Failed to detect location'
  }

  if (error instanceof globalThis.GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Geolocation permission denied'
      case error.POSITION_UNAVAILABLE:
        return 'Geolocation unavailable'
      case error.TIMEOUT:
        return 'Geolocation timeout'
      default:
        return 'Failed to detect location'
    }
  }

  return 'Failed to detect location'
}

interface GeolocationOptions {
  timeout?: number
  enableHighAccuracy?: boolean
  maximumAge?: number
}

/**
 * A compromised version of getCurrentPosition with a timeout
 */
export function getCurrentPosition(
  options: GeolocationOptions = {}
): Promise<globalThis.GeolocationPosition> {
  const { timeout = 10000, enableHighAccuracy = true, maximumAge = 0 } = options

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Geolocation timeout'))
    }, timeout)

    navigator.geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeoutId)
        resolve(position)
      },
      error => {
        clearTimeout(timeoutId)
        reject(error)
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  })
}
