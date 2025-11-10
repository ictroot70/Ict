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
    unoptimized: process.env.NODE_ENV === 'development', // Отключить только в development
  },

  /* config options here */
}

export default nextConfig
