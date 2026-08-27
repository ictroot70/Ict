'use client'

import type { StaticImageData } from 'next/image'

import React, { useEffect, useMemo, useState } from 'react'

import { Avatar } from '@/shared/composites'
import { Close, ImageOutline, Typography } from '@/shared/ui'

import s from './AvatarPreview.module.scss'

interface AvatarPreviewProps {
  value?: string | StaticImageData | File
  isSubmitting: boolean
  isLoading?: boolean
  onDeleteClick: () => void
}

const AvatarPlaceholder = React.memo(function AvatarPlaceholder() {
  return (
    <div className={s.placeholder}>
      <ImageOutline size={48} />
    </div>
  )
})

function isEmptyValue(value?: unknown) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

export function AvatarPreview({
  value,
  isSubmitting,
  isLoading,
  onDeleteClick,
}: Readonly<AvatarPreviewProps>) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const isBusy = Boolean(isLoading || isSubmitting)

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)

      setObjectUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setObjectUrl(null)
    }
  }, [value])

  const imageSrc = useMemo(() => {
    if (value instanceof File) {
      return objectUrl ?? undefined
    }

    return isEmptyValue(value) ? undefined : (value as string | StaticImageData)
  }, [value, objectUrl])

  const hasImage = Boolean(imageSrc)

  let avatarElement: React.ReactNode = <AvatarPlaceholder />

  if (hasImage) {
    avatarElement = <Avatar size={192} image={imageSrc} />
  }

  const overlayA11yProps = { role: 'status', 'aria-live': 'polite' } as const

  return (
    <div className={s.avatarContainer} {...(isBusy ? { 'aria-busy': 'true' } : {})}>
      <div className={s.avatar}>{avatarElement}</div>

      {hasImage && !isSubmitting && (
        <button
          className={s.deleteBtn}
          type={'button'}
          disabled={isLoading || isSubmitting}
          onClick={onDeleteClick}
          aria-label={'Delete avatar'}
          {...(isLoading || isSubmitting ? { 'aria-disabled': 'true' } : {})}
        >
          <Close svgProps={{ className: s.icon }} size={16} />
        </button>
      )}

      {isBusy && (
        <div className={s.overlay} {...overlayA11yProps}>
          <Typography variant={'regular_14'}>{'Processing…'}</Typography>
        </div>
      )}
    </div>
  )
}
