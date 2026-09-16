'use client'

import { ChangeEvent, ReactNode, useRef } from 'react'

import { Button, ImageOutline } from '@/shared/ui'

import styles from './ImageAttachButton.module.scss'

type ImageAttachButtonProps = {
  disabled?: boolean
  onImageSelect: (file: File) => void
  children?: ReactNode
}

export function ImageAttachButton({ disabled, onImageSelect, children }: ImageAttachButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleOpenFilePicker = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    onImageSelect(file)
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type={'file'}
        accept={'image/png,image/jpeg'}
        hidden
        onChange={handleFileChange}
      />

      <Button
        type={'button'}
        variant={'text'}
        disabled={disabled}
        onClick={handleOpenFilePicker}
        className={styles.button}
      >
        {children ?? <ImageOutline size={24} />}
      </Button>
    </>
  )
}
