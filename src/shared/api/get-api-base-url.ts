const DEFAULT_DEV_API_BASE = '/api/proxy'
const DEFAULT_INTERNAL_ORIGIN = 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value)
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

const getRequiredProductionApiBase = () => {
  const configuredBase = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL?.trim() || '')

  if (!configuredBase) {
    throw new Error('NEXT_PUBLIC_API_URL must be defined in production')
  }

  if (!isAbsoluteUrl(configuredBase)) {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute URL in production')
  }

  return configuredBase
}

export const getApiBaseUrl = () => {
  if (isProduction) {
    return getRequiredProductionApiBase()
  }

  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_DEV_API_BASE
  const effectiveBase = trimTrailingSlash(configuredBase)

  if (isAbsoluteUrl(effectiveBase)) {
    return effectiveBase
  }

  if (typeof window !== 'undefined') {
    return ensureLeadingSlash(effectiveBase)
  }

  if (effectiveBase.startsWith('/')) {
    const apiProxyTarget = trimTrailingSlash(process.env.API_PROXY_TARGET?.trim() || '')

    if (apiProxyTarget) {
      return apiProxyTarget
    }
  }

  const internalOrigin = trimTrailingSlash(
    process.env.INTERNAL_APP_ORIGIN || process.env.NEXT_PUBLIC_APP_ORIGIN || DEFAULT_INTERNAL_ORIGIN
  )

  return `${internalOrigin}${ensureLeadingSlash(effectiveBase)}`
}

export const buildApiUrl = (path: string) => `${getApiBaseUrl()}${path}`
