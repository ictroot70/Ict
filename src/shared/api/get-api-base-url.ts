const DEFAULT_DEV_API_BASE = '/api/proxy'
const DEFAULT_INTERNAL_ORIGIN = 'http://localhost:3000'

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value)
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

export const getApiBaseUrl = () => {
  const configuredBase = process.env.NEXT_PUBLIC_API_URL || DEFAULT_DEV_API_BASE
  const normalizedBase = trimTrailingSlash(configuredBase)

  if (isAbsoluteUrl(normalizedBase)) {
    return normalizedBase
  }

  if (typeof window !== 'undefined') {
    return ensureLeadingSlash(normalizedBase)
  }

  if (normalizedBase.startsWith('/')) {
    const apiProxyTarget = trimTrailingSlash(process.env.API_PROXY_TARGET || '')

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
