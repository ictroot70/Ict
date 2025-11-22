import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['staging-it-incubator.s3.eu-central-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staging-it-incubator.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/trainee-instagram-api/**',
      },
    ],
  },

  /* config options here */
}

export default nextConfig
