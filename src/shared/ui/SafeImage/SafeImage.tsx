'use client'

import { useEffect, useRef, useState } from 'react'

import { logger } from '@/shared/lib'
import Image, { type ImageProps } from 'next/image'

type SafeImageProps = ImageProps & {
  fallbackSrc?: ImageProps['src']
  telemetryLabel?: string
}

const DEFAULT_FALLBACK_SRC: ImageProps['src'] = '/default-image.svg'

const normalizeSrc = (src: ImageProps['src']): string => {
  if (typeof src === 'string') {
    return src
  }

  return 'default' in src ? src.default.src : src.src
}

export const SafeImage = ({
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  onError,
  src,
  telemetryLabel = 'SafeImage',
  ...rest
}: SafeImageProps) => {
  const [useFallback, setUseFallback] = useState(false)
  const telemetryLoggedRef = useRef(false)

  useEffect(() => {
    setUseFallback(false)
    telemetryLoggedRef.current = false
  }, [src])

  const handleError: NonNullable<ImageProps['onError']> = event => {
    const failedRuntimeSrc = event.currentTarget.currentSrc || event.currentTarget.src
    const failedOptimizationRequest = failedRuntimeSrc.includes('/_next/image')
    const sourceSrc = useFallback ? fallbackSrc : src

    if (failedOptimizationRequest && !telemetryLoggedRef.current) {
      telemetryLoggedRef.current = true

      logger.error('[SafeImage] Optimized image request failed', {
        component: telemetryLabel,
        failedRuntimeSrc,
        requestedSrc: normalizeSrc(sourceSrc),
        fallbackSrc: normalizeSrc(fallbackSrc),
      })
    }

    const canSwitchToFallback = !useFallback && normalizeSrc(src) !== normalizeSrc(fallbackSrc)

    if (canSwitchToFallback) {
      setUseFallback(true)
    }

    onError?.(event)
  }

  return <Image {...rest} src={useFallback ? fallbackSrc : src} onError={handleError} />
}
