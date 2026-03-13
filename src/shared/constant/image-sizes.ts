import type { ImageProps } from 'next/image'

type ImageLoadingStrategy = Pick<ImageProps, 'fetchPriority' | 'loading' | 'priority'>

export const IMAGE_SIZES = {
  PUBLIC_POST:
    '(max-width: 640px) 100vw, (max-width: 968px) calc(50vw - 12px), (max-width: 1200px) calc(33vw - 12px), 234px',
  POST_CARD:
    '(max-width: 640px) 100vw, (max-width: 968px) calc(50vw - 12px), (max-width: 1200px) calc(33vw - 12px), 234px',
  POST_MODAL: '(max-width: 968px) 95vw, 490px',
} as const

export const IMAGE_LOADING_STRATEGY = {
  lcp: { priority: true, fetchPriority: 'high', loading: 'eager' },
  default: { priority: false, fetchPriority: 'auto', loading: 'lazy' },
  low: { priority: false, fetchPriority: 'low', loading: 'lazy' },
} satisfies Record<'default' | 'lcp' | 'low', ImageLoadingStrategy>

export const getAvatarImageSizes = (size: number): string => `${size}px`
