import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'

const isProduction = process.env.NODE_ENV === 'production'
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || ''

if (isProduction) {
  if (!configuredApiBase) {
    throw new Error('NEXT_PUBLIC_API_URL must be defined in production')
  }

  if (configuredApiBase.startsWith('/')) {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute URL in production')
  }
}

const apiBase = configuredApiBase || '/api/proxy'
const apiProxyTarget = process.env.API_PROXY_TARGET?.trim() || ''
const normalizedApiBase = apiBase.replace(/\/+$/, '')
const normalizedApiProxyTarget = trimTrailingSlash(apiProxyTarget)

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
    if (!normalizedApiBase.startsWith('/')) {
      return []
    }

    if (!normalizedApiProxyTarget) {
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

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
