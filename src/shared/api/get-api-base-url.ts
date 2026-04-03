const DEFAULT_DEV_API_BASE = '/api/proxy'
const DEFAULT_API_TARGET = 'https://ictroot.uk/api'
const DEFAULT_INTERNAL_ORIGIN = 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value)
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

export const getApiBaseUrl = () => {
  const configuredBase =
    process.env.NEXT_PUBLIC_API_URL || (isProduction ? DEFAULT_API_TARGET : DEFAULT_DEV_API_BASE)
  const normalizedBase = trimTrailingSlash(configuredBase)
  const effectiveBase =
    isProduction && normalizedBase.startsWith('/') ? DEFAULT_API_TARGET : normalizedBase

  if (isAbsoluteUrl(effectiveBase)) {
    return effectiveBase
  }

  if (typeof window !== 'undefined') {
    return ensureLeadingSlash(effectiveBase)
  }

  if (effectiveBase.startsWith('/')) {
    const apiProxyTarget = trimTrailingSlash(process.env.API_PROXY_TARGET || DEFAULT_API_TARGET)

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
