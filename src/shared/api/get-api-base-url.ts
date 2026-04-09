const DEFAULT_DEV_API_BASE = 'https://ictroot.uk/api'
const DEFAULT_DEV_PROXY_BASE = '/api/proxy'
const DEFAULT_API_PROXY_TARGET = 'https://ictroot.uk/api'
const DEFAULT_INTERNAL_ORIGIN = 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'
const isProxyMode = !isProduction && process.env.USE_API_PROXY === 'true'

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value)
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)
const stripProxySuffix = (value: string) => value.replace(/\/proxy$/, '')

const getProductionApiBase = () => {
  const configuredBase = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL?.trim() || '')

  if (configuredBase && isAbsoluteUrl(configuredBase)) {
    return stripProxySuffix(configuredBase)
  }

  return stripProxySuffix(
    trimTrailingSlash(process.env.API_PROXY_TARGET?.trim() || DEFAULT_API_PROXY_TARGET)
  )
}

export const getApiBaseUrl = () => {
  if (isProduction) {
    return getProductionApiBase()
  }

  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.trim() || ''
  const fallbackBase = isProxyMode ? DEFAULT_DEV_PROXY_BASE : DEFAULT_DEV_API_BASE
  let normalizedBase = trimTrailingSlash(configuredBase || fallbackBase)

  if (!isProxyMode && normalizedBase.startsWith('/')) {
    normalizedBase = DEFAULT_DEV_API_BASE
  }

  if (isAbsoluteUrl(normalizedBase)) {
    return normalizedBase
  }

  if (typeof window !== 'undefined') {
    return ensureLeadingSlash(normalizedBase)
  }

  if (normalizedBase.startsWith('/')) {
    const apiProxyTarget = trimTrailingSlash(
      process.env.API_PROXY_TARGET || (isProxyMode ? DEFAULT_API_PROXY_TARGET : '')
    )
    if (apiProxyTarget) {
      return apiProxyTarget
    }
  }

  const internalOrigin = trimTrailingSlash(
    process.env.INTERNAL_APP_ORIGIN || process.env.NEXT_PUBLIC_APP_ORIGIN || DEFAULT_INTERNAL_ORIGIN
  )

  return `${internalOrigin}${ensureLeadingSlash(normalizedBase)}`
}

export const buildApiUrl = (path: string) => `${getApiBaseUrl()}${path}`
