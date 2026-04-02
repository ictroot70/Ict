import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
const apiProxyTarget = process.env.API_PROXY_TARGET || 'https://ictroot.uk/api'
const normalizedApiBase = apiBase.replace(/\/+$/, '')
const normalizedApiProxyTarget = apiProxyTarget.replace(/\/+$/, '')

const DEFAULT_IMAGE_SOURCE_HOSTNAME = 'staging-it-incubator.s3.eu-central-1.amazonaws.com'
const DEFAULT_IMAGE_SOURCE_PATHNAME = '/trainee-instagram-api/**'
const DEFAULT_IMAGE_MIN_CACHE_TTL = 60 * 60 * 24 * 30 // 30 days
const DEFAULT_IMAGE_STALE_WHILE_REVALIDATE = 60 * 60 * 24 // 1 day
const DEFAULT_IMAGE_STALE_IF_ERROR = 60 * 60 * 24 * 7 // 7 days

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const imageSourceHostname = process.env.NEXT_IMAGE_SOURCE_HOSTNAME || DEFAULT_IMAGE_SOURCE_HOSTNAME
const imageSourcePathname = process.env.NEXT_IMAGE_SOURCE_PATHNAME || DEFAULT_IMAGE_SOURCE_PATHNAME
const imageCdnHostname = process.env.NEXT_IMAGE_CDN_HOSTNAME?.trim()
const imageMinimumCacheTtl = parsePositiveInt(
  process.env.NEXT_IMAGE_MIN_CACHE_TTL,
  DEFAULT_IMAGE_MIN_CACHE_TTL
)
const imageStaleWhileRevalidate = parsePositiveInt(
  process.env.NEXT_IMAGE_STALE_WHILE_REVALIDATE,
  DEFAULT_IMAGE_STALE_WHILE_REVALIDATE
)
const imageStaleIfError = parsePositiveInt(
  process.env.NEXT_IMAGE_STALE_IF_ERROR,
  DEFAULT_IMAGE_STALE_IF_ERROR
)
const imageOptimizerDisabled = process.env.NEXT_IMAGE_UNOPTIMIZED === '1'
const imageCdnCacheControl = `public, s-maxage=${imageMinimumCacheTtl}, stale-while-revalidate=${imageStaleWhileRevalidate}, stale-if-error=${imageStaleIfError}`

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: imageSourceHostname,
        port: undefined,
        pathname: imageSourcePathname,
      },
      ...(imageCdnHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: imageCdnHostname,
              port: undefined,
              pathname: '/**',
            },
          ]
        : []),
    ],
    minimumCacheTTL: imageMinimumCacheTtl,
    deviceSizes: [320, 420, 640, 768, 968, 1200],
    imageSizes: [36, 40, 234, 490],
    formats: ['image/webp'],
    unoptimized: imageOptimizerDisabled,
  },
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'CDN-Cache-Control',
            value: imageCdnCacheControl,
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: imageCdnCacheControl,
          },
        ],
      },
    ]
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

const withNextIntl = createNextIntlPlugin()

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withNextIntl(nextConfig))
