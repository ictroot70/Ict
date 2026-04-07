import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'

const DEFAULT_API_TARGET = 'https://ictroot.uk/api'
const isProduction = process.env.NODE_ENV === 'production'
const configuredApiBase = process.env.NEXT_PUBLIC_API_URL
const apiProxyTarget = process.env.API_PROXY_TARGET || DEFAULT_API_TARGET
const apiBase =
  isProduction && configuredApiBase?.startsWith('/')
    ? apiProxyTarget
    : configuredApiBase || (isProduction ? apiProxyTarget : '/api/proxy')
const normalizedApiBase = apiBase.replace(/\/+$/, '')
const normalizedApiProxyTarget = apiProxyTarget.replace(/\/+$/, '')

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
