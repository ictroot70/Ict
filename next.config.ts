import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const DEFAULT_DEV_API_BASE = 'https://ictroot.uk/api'
const DEFAULT_DEV_PROXY_BASE = '/api/proxy'
const DEFAULT_API_PROXY_TARGET = 'https://ictroot.uk/api'
const isProduction = process.env.NODE_ENV === 'production'
const isProxyMode = !isProduction && process.env.USE_API_PROXY === 'true'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const stripProxySuffix = (value: string) => value.replace(/\/proxy$/, '')

const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || ''
const normalizedApiProxyTarget = stripProxySuffix(
  trimTrailingSlash(process.env.API_PROXY_TARGET?.trim() || DEFAULT_API_PROXY_TARGET)
)
let apiBase = configuredApiBase || DEFAULT_DEV_API_BASE

if (isProduction) {
  const hasAbsoluteConfiguredBase = configuredApiBase && !configuredApiBase.startsWith('/')

  apiBase = hasAbsoluteConfiguredBase
    ? stripProxySuffix(trimTrailingSlash(configuredApiBase))
    : normalizedApiProxyTarget
} else if (isProxyMode) {
  apiBase = configuredApiBase || DEFAULT_DEV_PROXY_BASE
} else if (configuredApiBase.startsWith('/')) {
  apiBase = DEFAULT_DEV_API_BASE
}

const normalizedApiBase = trimTrailingSlash(apiBase)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staging-it-incubator.s3.eu-central-1.amazonaws.com',
        port: undefined,
        pathname: '/trainee-instagram-api/**',
      },
    ],
  },
  async rewrites() {
    if (isProduction || !isProxyMode) {
      return []
    }

    if (!normalizedApiBase.startsWith('/')) {
      return []
    }

    return [
      {
        source: `${normalizedApiBase}/:path*`,
        destination: `${normalizedApiProxyTarget}/:path*`,
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin()

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withNextIntl(nextConfig))
