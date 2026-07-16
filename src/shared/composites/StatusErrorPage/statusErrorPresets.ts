export type ErrorDisplayVariant = 'neon' | 'offline'

export type StatusErrorPreset = {
  description: string
  statusCode: number | string
  title: string
  variant: ErrorDisplayVariant
}

const STATUS_PRESETS: Record<number, Omit<StatusErrorPreset, 'statusCode'>> = {
  400: {
    title: 'Bad Request',
    description: 'The server could not understand the request.',
    variant: 'neon',
  },
  401: {
    title: 'Unauthorized',
    description: 'Please sign in to continue.',
    variant: 'neon',
  },
  403: {
    title: 'Forbidden',
    description: "You don't have permission to access this page.",
    variant: 'neon',
  },
  404: {
    title: 'Not Found',
    description: 'The requested page could not be found.',
    variant: 'neon',
  },
  408: {
    title: 'Request Timeout',
    description: 'The server timed out waiting for the request.',
    variant: 'neon',
  },
  429: {
    title: 'Too Many Requests',
    description: 'You have sent too many requests in a given amount of time.',
    variant: 'neon',
  },
  500: {
    title: 'Internal Server Error',
    description: 'Something went wrong on our side.',
    variant: 'neon',
  },
  502: {
    title: 'Bad Gateway',
    description: 'The server received an invalid response.',
    variant: 'neon',
  },
  503: {
    title: 'Service Unavailable',
    description: 'The server is currently unable to handle the request.',
    variant: 'neon',
  },
}

const OFFLINE_PRESET: StatusErrorPreset = {
  statusCode: 'offline',
  title: 'Server unavailable',
  description: 'Please check your internet connection or try again later.',
  variant: 'offline',
}

function normalizeStatusCode(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 400 && value <= 599) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isInteger(parsed) && parsed >= 400 && parsed <= 599) {
      return parsed
    }
  }

  return null
}

export function getOfflineErrorPreset(): StatusErrorPreset {
  return OFFLINE_PRESET
}

export function getStatusErrorPreset(statusCode: null | number | undefined): StatusErrorPreset {
  const normalizedStatusCode = normalizeStatusCode(statusCode)

  if (!normalizedStatusCode) {
    return {
      statusCode: 500,
      ...STATUS_PRESETS[500],
    }
  }

  const preset = STATUS_PRESETS[normalizedStatusCode]

  if (!preset) {
    return {
      statusCode: normalizedStatusCode,
      ...STATUS_PRESETS[500],
    }
  }

  return {
    statusCode: normalizedStatusCode,
    ...preset,
  }
}
