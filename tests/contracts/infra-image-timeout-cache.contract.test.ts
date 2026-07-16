import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('INFRA-P1.5-NEXT-IMAGE-CACHE-STABILIZATION', () => {
  it('keeps image cache headers for CDN resilience on /_next/image', () => {
    const source = readSource('next.config.ts')

    expect(source).toContain("source: '/_next/image'")
    expect(source).toContain("'CDN-Cache-Control'")
    expect(source).toContain("'Cloudflare-CDN-Cache-Control'")
    expect(source).toContain('stale-if-error=')
    expect(source).toContain('stale-while-revalidate=')
  })

  it('keeps image optimizer cache/variant constraints to reduce serial origin load', () => {
    const source = readSource('next.config.ts')

    expect(source).toContain('minimumCacheTTL: imageMinimumCacheTtl')
    expect(source).toContain('deviceSizes: [320, 420, 640, 768, 968, 1200]')
    expect(source).toContain('imageSizes: [36, 40, 234, 490]')
    expect(source).toContain("formats: ['image/webp']")
  })

  it('keeps env-controlled switches for S3/CDN origin and emergency optimizer bypass', () => {
    const source = readSource('next.config.ts')
    const envExample = readSource('.env.example')

    expect(source).toContain('NEXT_IMAGE_SOURCE_HOSTNAME')
    expect(source).toContain('NEXT_IMAGE_CDN_HOSTNAME')
    expect(source).toContain('NEXT_IMAGE_UNOPTIMIZED')
    expect(source).toContain('unoptimized: imageOptimizerDisabled')

    expect(envExample).toContain('NEXT_IMAGE_SOURCE_HOSTNAME=')
    expect(envExample).toContain('NEXT_IMAGE_SOURCE_PATHNAME=')
    expect(envExample).toContain('NEXT_IMAGE_CDN_HOSTNAME=')
    expect(envExample).toContain('NEXT_IMAGE_MIN_CACHE_TTL=')
    expect(envExample).toContain('NEXT_IMAGE_STALE_WHILE_REVALIDATE=')
    expect(envExample).toContain('NEXT_IMAGE_STALE_IF_ERROR=')
    expect(envExample).toContain('NEXT_IMAGE_UNOPTIMIZED=')
  })
})
