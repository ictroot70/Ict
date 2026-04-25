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
  // Server-only: k8s / private network often cannot resolve or reach the public
  // browser URL — use an internal service base (no NEXT_PUBLIC_ prefix on purpose).
  const isServer = globalThis.window === undefined
  const internalBase = trimTrailingSlash(process.env.INTERNAL_API_BASE_URL?.trim() || '')

  if (isServer && internalBase && isAbsoluteUrl(internalBase)) {
    return stripProxySuffix(internalBase)
  }

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

  if (globalThis.window !== undefined) {
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
